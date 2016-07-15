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
      const creator = result.package.metadata[0]['dc:creator'][0]._;

      const book = result.package.manifest[0].item.reduce((total, item) => {
        total[item.$.id] = {
          href: item.$.href,
          mediaType: item.$['media-type']
        };

        return total;
      }, {});

      const promises = result.package.spine[0].itemref.map(item => {
        const id = item.$.idref;
        const chapter = book[id];

        return getTextEntry(chapter.href)
          .then(data => {
            const $ = cheerio.load(data);

            return {
              id,
              html: translate($('body')[0])
            };
          });
      });

      return Promise.all(promises)
        .then(chapters => ({
          title,
          lang,
          creator,
          chapters
        }));
    });
};
