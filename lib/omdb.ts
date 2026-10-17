import axios from 'axios'

const API_KEY = process.env.NEXT_PUBLIC_OMDB_KEY
const BASE_URL = 'https://www.omdbapi.com/'

export interface MovieSummary {
  imdbID: string
  Title: string
  Year: string
  Type: string
  Poster: string
}

export interface MovieDetail extends MovieSummary {
  Rated: string
  Released: string
  Runtime: string
  Genre: string
  Director: string
  Writer: string
  Actors: string
  Plot: string
  Language: string
  Country: string
  Awards: string
  imdbRating: string
  imdbVotes: string
}

export async function searchMovies(query: string): Promise<MovieSummary[]> {
  const { data } = await axios.get(BASE_URL, {
    params: { apikey: API_KEY, s: query },
  })
  if (data.Response === 'False') return []
  return data.Search as MovieSummary[]
}

export async function getMovieById(id: string): Promise<MovieDetail> {
  const { data } = await axios.get(BASE_URL, {
    params: { apikey: API_KEY, i: id, plot: 'full' },
  })
  return data as MovieDetail
}