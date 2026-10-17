import Link from 'next/link'
import { getMovieById } from '@/lib/omdb'
export const dynamic = 'force-dynamic'

const POPULAR_IDS = [
  'tt0111161', // The Shawshank Redemption
  'tt0068646', // The Godfather
  'tt0468569', // The Dark Knight
  'tt0137523', // Fight Club
  'tt1375666', // Inception
  'tt0133093', // The Matrix
  'tt0816692', // Interstellar
  'tt0109830', // Forrest Gump
  'tt0903747', // Breaking Bad
  'tt0944947', // Game of Thrones
  'tt4574334', // Stranger Things
  'tt0386676', // The Office
]

export default async function Home() {
  const movies = await Promise.all(POPULAR_IDS.map((id) => getMovieById(id)))

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <h1 className="text-2xl font-bold">🎬 Galería de Películas y Series</h1>
          <Link
            href="/search"
            className="px-5 py-2 bg-red-600 hover:bg-red-500 transition rounded-full font-semibold"
          >
            🔎 Buscar
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Populares</h2>
          <p className="text-slate-400 mt-1">
            Lista cargada en el servidor (SSR) antes de enviar el HTML.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.map((movie) => (
            <div
              key={movie.imdbID}
              className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 hover:border-red-500 hover:-translate-y-1 transition"
            >
              {movie.Poster !== 'N/A' ? (
                <img
                  src={movie.Poster}
                  alt={movie.Title}
                  className="w-full h-80 object-cover"
                />
              ) : (
                <div className="w-full h-80 flex items-center justify-center bg-slate-800 text-slate-500">
                  Sin póster
                </div>
              )}
              <div className="p-4">
                <h3 className="font-bold leading-tight">{movie.Title}</h3>
                <div className="flex items-center justify-between mt-2 text-sm text-slate-400">
                  <span>{movie.Year}</span>
                  <span className="text-yellow-400 font-semibold">⭐ {movie.imdbRating}</span>
                </div>
                <span className="inline-block mt-2 px-2 py-0.5 text-xs bg-red-600/20 text-red-400 rounded-full capitalize">
                  {movie.Type}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 p-4 bg-green-950 rounded-lg border border-green-800">
          <p className="text-sm text-green-300">
            ✅ <strong>SSR:</strong> los datos se obtienen en el servidor. Si ves el código fuente
            (Ctrl + U), ya aparecen los títulos de las películas en el HTML.
          </p>
        </div>
      </main>
    </div>
  )
}