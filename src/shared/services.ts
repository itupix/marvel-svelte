import type { CharacterDetailsType } from '../types/CharacterDetailsType';
import { apiKey } from './config';
import { offset, total } from './stores';

export const fetchCharacters = async (query: string, _offset: number) => {
  const name = query ? `&nameStartsWith=${query}` : '';
  const current = _offset ? `&offset=${_offset}` : '';

  const res = await fetch(`https://gateway.marvel.com:443/v1/public/characters?apikey=${apiKey}${name}${current}`);
  const { data } = await res.json();
  const { results } = data;

  offset.set(data.offset);
  total.set(data.total);

  const characters: CharacterDetailsType[] = results;

  return characters;
}

export const fetchCollection = async url => {
  const res = await fetch(`${url}?apikey=${apiKey}`);
  const { data } = await res.json();
  const { results } = data;

  return results;
}
