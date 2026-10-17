'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  searchMovies,
  getMovieById,
  MovieSummary,
  MovieDetail,
} from '@/lib/omdb'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<MovieSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<MovieDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const term = query.trim()
  const canShow = term.length >= 3

  // Búsqueda en tiempo real (con debounce de 500 ms)
  useEffect(() => {
    if (term.length < 3) return

    const timer = setTimeout(async () => {
      setLoading(true)
      setError('')
      try {
        const data = await searchMovies(term)
        setResults(data)
        if (data.length === 0) setError('No se encontraron resultados.')
      } catch {
        setError('Ocurrió un error al consultar la API.')
      } finally {
        setLoading(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [term])

  // Carga del detalle cuando se selecciona una película
  useEffect(() => {
    if (!selectedId) return
    let cancelled = false

    const loadDetail = async () => {
      setLoadingDetail(true)
      try {
        const data = await getMovieById(selectedId)
        if (!cancelled) setDetail(data)
      } catch {
        if (!cancelled) setDetail(null)
      } finally {
        if (!cancelled) setLoadingDetail(false)
      }
    }
    loadDetail()

    return () => {
      cancelled = true
    }
  }, [selectedId])

  // Cerrar el modal con la tecla Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedId(null)
        setDetail(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const closeModal = () => {
    setSelectedId(null)
    setDetail(null)
  }

  const visibleResults = canShow ? results : []

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <h1 className="text-2xl font-bold">🔎 Buscar películas y series</h1>
          <Link
            href="/"
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 transition rounded-full font-semibold"
          >
            ← Inicio
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Escribe al menos 3 letras (ej: marvel, suits, batman)..."
          className="w-full p-4 rounded-xl bg-slate-900 border-2 border-slate-700 focus:border-red-500 outline-none text-lg"
        />

        <div className="mt-8">
          {!canShow && (
            <p className="text-slate-400 text-center py-12">
              Empieza a escribir para ver resultados en tiempo real.
            </p>
          )}

          {canShow && loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-red-500 mx-auto"></div>
              <p className="mt-4 text-slate-400">Buscando...</p>
            </div>
          )}

          {canShow && !loading && error && (
            <p className="text-center text-red-400 py-12">{error}</p>
          )}

          {canShow && !loading && !error && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {visibleResults.map((movie) => (
                <button
                  key={movie.imdbID}
                  onClick={() => setSelectedId(movie.imdbID)}
                  className="text-left bg-slate-900 rounded-xl overflow-hidden border border-slate-800 hover:border-red-500 hover:-translate-y-1 transition cursor-pointer"
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
                      <span className="px-2 py-0.5 text-xs bg-red-600/20 text-red-400 rounded-full capitalize">
                        {movie.Type}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-10 p-4 bg-blue-950 rounded-lg border border-blue-800">
          <p className="text-sm text-blue-300">
            🔄 <strong>CSR:</strong> la búsqueda se hace en el navegador, sin recargar la página.
            Mira el Network tab (Fetch/XHR) para ver cada petición.
          </p>
        </div>
      </main>

      {/* Modal de detalle */}
      {selectedId && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="relative bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-slate-800 hover:bg-red-600 transition font-bold"
              aria-label="Cerrar"
            >
              ✕
            </button>

            {loadingDetail || !detail ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-red-500 mx-auto"></div>
                <p className="mt-4 text-slate-400">Cargando detalle...</p>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-6 p-6">
                {detail.Poster !== 'N/A' ? (
                  <img
                    src={detail.Poster}
                    alt={detail.Title}
                    className="w-full md:w-64 rounded-xl object-cover self-start"
                  />
                ) : (
                  <div className="w-full md:w-64 h-96 flex items-center justify-center bg-slate-800 text-slate-500 rounded-xl">
                    Sin póster
                  </div>
                )}

                <div className="flex-1">
                  <h2 className="text-3xl font-bold pr-8">{detail.Title}</h2>
                  <p className="text-slate-400 mt-1">
                    {detail.Year} · {detail.Rated} · {detail.Runtime}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {detail.Genre?.split(', ').map((g) => (
                      <span
                        key={g}
                        className="px-3 py-1 text-sm bg-red-600 rounded-full font-semibold"
                      >
                        {g}
                      </span>
                    ))}
                  </div>

                  <p className="mt-4 text-yellow-400 font-bold text-lg">
                    ⭐ {detail.imdbRating}{' '}
                    <span className="text-sm text-slate-400 font-normal">
                      ({detail.imdbVotes} votos)
                    </span>
                  </p>

                  <p className="mt-4 text-slate-300 leading-relaxed">{detail.Plot}</p>

                  <dl className="mt-4 space-y-1 text-sm">
                    <div><dt className="inline font-semibold text-slate-400">Director: </dt><dd className="inline">{detail.Director}</dd></div>
                    <div><dt className="inline font-semibold text-slate-400">Guion: </dt><dd className="inline">{detail.Writer}</dd></div>
                    <div><dt className="inline font-semibold text-slate-400">Reparto: </dt><dd className="inline">{detail.Actors}</dd></div>
                    <div><dt className="inline font-semibold text-slate-400">Estreno: </dt><dd className="inline">{detail.Released}</dd></div>
                    <div><dt className="inline font-semibold text-slate-400">Idioma: </dt><dd className="inline">{detail.Language}</dd></div>
                    <div><dt className="inline font-semibold text-slate-400">País: </dt><dd className="inline">{detail.Country}</dd></div>
                    <div><dt className="inline font-semibold text-slate-400">Premios: </dt><dd className="inline">{detail.Awards}</dd></div>
                  </dl>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}