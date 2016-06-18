'use strict';

import got from 'got';
import pify from 'pify';

import { parseString as parseStringCb } from 'xml2js';
const parseString = pify(parseStringCb);

module.exports = find;

function find() {
  return dlnaRequest()
    .then(res => parseString(res))
    .then(result => {
      const res = result['s:Envelope']['s:Body'][0]['u:SearchResponse'][0].Result[0];
      return parseString(res);
    })
    .then(result => {
      const items = result['DIDL-Lite'].item.map(item => {
        const file = item['dc:title'][0];
        const url = item.res[0]._;

        return { file, url };
      });

      return items;
    });
}

function dlnaRequest() {
  const body = `
    <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
      <s:Body>
        <u:Browse xmlns:u="urn:schemas-upnp-org:service:ContentDirectory:1">
          <ObjectID>0</ObjectID>
          <BrowseFlag>BrowseDirectChildren</BrowseFlag>
          <Filter>id,dc:title,res,sec:CaptionInfo,sec:CaptionInfoEx</Filter>
          <StartingIndex>0</StartingIndex>
          <RequestedCount>0</RequestedCount>
          <SortCriteria></SortCriteria>
        </u:Browse>
      </s:Body>
    </s:Envelope>
  `;

  const params = {
    method: 'POST',
    headers: {
      'Accept': '*/*',
      'Content-Type': 'text/xml; charset="utf-8"',
      'SOAPAction': 'urn:schemas-upnp-org:service:ContentDirectory:1#Search"'
    },
    body
  };

  return got('http://minidlna:8200/ctl/ContentDir', params)
    .then(data => {
      return data.body;
    });
}
