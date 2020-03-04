import { offset, total } from './stores';
import { apiKey } from './config';

export const fetchCharacters = async ({ query, offset: _offset }) => {
  const name = query ? `&nameStartsWith=${query}` : '';
  const current = _offset ? `&offset=${_offset}` : '';

  const res = await fetch(`https://gateway.marvel.com:443/v1/public/characters?apikey=${apiKey}${name}${current}`);
  const { data } = await res.json();
  const { results } = data;

  offset.set(data.offset);
  total.set(data.total);

  return results;
}

export const fetchCollection = async url => {
  const res = await fetch(`${url}?apikey=${apiKey}`);
  const { data } = await res.json();
  const { results } = data;

  return results
}