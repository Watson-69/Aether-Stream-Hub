import { describe, it, expect } from 'vitest';
import type {
  MediaItem,
  StreamLogEntry,
  Server,
  Genre,
  ItemDetails,
  Episode,
  HomeSections,
  SearchFilters,
} from '../lib/types';

describe('Type Definitions', () => {
  // These are compile-time tests - if they compile, the types are valid
  it('should allow valid MediaItem', () => {
    const media: MediaItem = {
      id: 'movie-550',
      tmdbId: 550,
      type: 'movie',
      title: 'Fight Club',
      year: '1999',
      duration: '139 min',
      rating: '8.8',
      genre: 'Drama',
      genres: ['Drama'],
      poster: 'https://image.tmdb.org/t/p/w500/poster.jpg',
      backdrop: 'https://image.tmdb.org/t/p/original/backdrop.jpg',
      overview: 'A test overview',
    };

    expect(media.id).toBe('movie-550');
    expect(media.type).toBe('movie');
  });

  it('should allow TV type MediaItem', () => {
    const media: MediaItem = {
      id: 'tv-1399',
      tmdbId: 1399,
      type: 'tv',
      title: 'Game of Thrones',
      year: '2011',
      duration: 'TV Series',
      rating: '9.2',
      genre: 'Fantasy',
      genres: ['Fantasy', 'Drama', 'Action'],
      poster: 'https://image.tmdb.org/t/p/w500/poster.jpg',
      backdrop: 'https://image.tmdb.org/t/p/original/backdrop.jpg',
      overview: 'A test overview',
    };

    expect(media.type).toBe('tv');
  });

  it('should allow valid StreamLogEntry', () => {
    const log: StreamLogEntry = {
      id: 'log-123',
      timestamp: '12:34:56',
      type: 'connect',
      tag: 'CONNECTED',
      message: 'Connected to node-01',
      media: {
        id: 'movie-550',
        tmdbId: 550,
        type: 'movie',
        title: 'Fight Club',
        year: '1999',
        duration: '139 min',
        rating: '8.8',
        genre: 'Drama',
        genres: ['Drama'],
        poster: 'https://image.tmdb.org/t/p/w500/poster.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/backdrop.jpg',
        overview: 'A test overview',
      },
      serverIndex: 0,
    };

    expect(log.type).toBe('connect');
  });

  it('should allow all log types', () => {
    const types: StreamLogEntry['type'][] = ['connect', 'server', 'watchlist', 'episode'];
    expect(types).toHaveLength(4);
  });

  it('should allow valid Server', () => {
    const server: Server = {
      id: 'vidlink',
      name: 'Server 1 (VidLink)',
      getMovieUrl: id => `https://vidlink.pro/movie/${id}`,
      getTvUrl: (id, s, e) => `https://vidlink.pro/tv/${id}/${s}/${e}`,
    };

    expect(server.getMovieUrl('550')).toBe('https://vidlink.pro/movie/550');
    expect(server.getTvUrl('1399', 1, 1)).toBe('https://vidlink.pro/tv/1399/1/1');
  });

  it('should allow valid Genre', () => {
    const genre: Genre = { id: 28, name: 'Action' };
    expect(genre.id).toBe(28);
    expect(genre.name).toBe('Action');
  });

  it('should allow valid ItemDetails', () => {
    const details: ItemDetails = {
      tagline: '"His whole life was a million-to-one shot."',
      duration: '1976 • 2h 0m • ★ 8.1',
      quality: 'MOVIE • HD',
      cast: [{ name: 'Sylvester Stallone', character: 'Rocky Balboa', profile_path: '/path.jpg' }],
      seasons: 1,
      episodes: 1,
      seasonsData: [{ season_number: 1, episode_count: 1 }],
    };

    expect(details.seasons).toBe(1);
    expect(details.cast).toHaveLength(1);
  });

  it('should allow valid Episode', () => {
    const episode: Episode = { episode_number: 1, name: 'Pilot' };
    expect(episode.episode_number).toBe(1);
  });

  it('should allow valid HomeSections', () => {
    const sections: HomeSections = {
      trending: [],
      popularMovies: [],
      popularTv: [],
      topRated: [],
      scifi: [],
      action: [],
    };

    expect(sections.trending).toEqual([]);
  });

  it('should allow valid SearchFilters', () => {
    const filters: SearchFilters = { query: 'fight club', genreId: '18', type: 'movie' };
    expect(filters.query).toBe('fight club');
    expect(filters.type).toBe('movie');
  });
});
