import cheerio from 'cheerio';
import pify from 'pify';
import { parseString } from 'xml2js';
import AdmZip from 'adm-zip';
import translate from './parser';

export default bookPath => {
  const zip = new AdmZip(bookPath);

  const entries = zip.getEntries().reduce((result, zipEntry) => {
    result[zipEntry.entryName] = zipEntry;
    return result;
  }, {});

  const getXmlEntry = name => pify(parseString)(entries[name].getData().toString());
  const getTextEntry = name => Promise.resolve(entries[name].getData().toString());

  return getXmlEntry('META-INF/container.xml')
    .then(data => {
      const fullPath = data.container.rootfiles[0].rootfile[0].$['full-path'];
      const mediaType = data.container.rootfiles[0].rootfile[0].$['media-type'];

      if (process.env.NODE_ENV !== 'production' && mediaType !== 'application/oebps-package+xml') {
        return Promise.reject(`unknown mediaType ${mediaType}`);
      }

      return getXmlEntry(fullPath);
    })
    .then(result => {
      const title = result.package.metadata[0]['dc:title'][0];
      const lang = result.package.metadata[0]['dc:language'][0];
      const author = result.package.metadata[0]['dc:creator'][0]._;

      const book = result.package.manifest[0].item.reduce((total, item) => {
        total[item.$.id] = {
          href: item.$.href,
          mediaType: item.$['media-type']
        };

        return total;
      }, {});

      const promises = result.package.spine[0].itemref.slice(0, 10).map(item => {
        const id = item.$.idref;
        const chapter = book[id];

        return getTextEntry(chapter.href)
          .then(data => {
            const $ = cheerio.load(data);
            const children = translate($('body')[0])
              .children
              .reduce((total, curr) => {
                return total.concat(curr.children);
              }, []);

            return {
              id,
              children
            };
          });
      });

      return Promise.all(promises)
        .then(_chapters => {
          const chapters = _chapters.reduce((total, chapter) => {
            const parts = partition(chapter, 1000)
              .map((part, i) => {
                const result = {
                  children: part,
                  id: `${chapter.id}-${i}`
                };

                result.length = getChapterLength(result);
                return result;
              });

            return total.concat(parts);
          }, []);

          return {
            title,
            lang,
            author,
            chapters
          };
        });
    });
};

function partition(chapter, charactersLimit) {
  const items = chapter.children;

  return items.reduce((total, curr) => {
    const item = curr;
    const last = total[total.length - 1];

    const prevCharactersLength = total.length === 0 ? 0 : getChapterLength({ children: last });
    const currCharactersLength = getChapterLength(item);

    const charactersLength = prevCharactersLength + currCharactersLength;

    if (charactersLength > charactersLimit) {
      if (currCharactersLength > charactersLimit) {
        return total.concat(partition(item, charactersLimit));
      } else {
        total.push([item]);
      }
    } else if (total.length === 0) {
      total.push([item]);
    } else {
      last.push(item);
    }

    return total;
  }, []);
}

function getChapterLength(chapter) {
  let result = chapter.text ? chapter.text.length : 0;

  if (chapter.children) {
    chapter.children.forEach(child => {
      result += getChapterLength(child);
    });
  }

  return result;
}
