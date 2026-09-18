"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from "react"
import { AUDIO_ANALYSER_FFT_SIZE, PORTFOLIO_TRACK } from "@/data/audio"

export type AudioIntensity = {
  overall: number
  bass: number
}

type AudioAnalysisFrame = {
  analyser: AnalyserNode
  data: Uint8Array<ArrayBuffer>
}

type AudioContextValue = {
  hasInteracted: boolean
  isPlaying: boolean
  togglePlayback: () => Promise<void>
  readAnalysisFrame: () => AudioAnalysisFrame | null
  intensityRef: MutableRefObject<AudioIntensity>
}

const PortfolioAudioContext = createContext<AudioContextValue | null>(null)

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const contextRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const frequencyDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null)
  const analysisFrameRef = useRef<AudioAnalysisFrame | null>(null)
  const intensityRef = useRef<AudioIntensity>({ overall: 0, bass: 0 })
  const [hasInteracted, setHasInteracted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const ensureAudio = useCallback(() => {
    const audio = audioRef.current
    if (!audio) throw new Error("Portfolio audio element is not mounted")
    audio.volume = PORTFOLIO_TRACK.volume
    return audio
  }, [])

  const ensureAudioGraph = useCallback((audio: HTMLAudioElement) => {
    if (contextRef.current && analyserRef.current) return contextRef.current

    const context = new AudioContext()
    const analyser = context.createAnalyser()
    analyser.fftSize = AUDIO_ANALYSER_FFT_SIZE
    analyser.smoothingTimeConstant = 0.72

    const source = context.createMediaElementSource(audio)
    source.connect(analyser)
    analyser.connect(context.destination)

    contextRef.current = context
    sourceRef.current = source
    analyserRef.current = analyser
    frequencyDataRef.current = new Uint8Array(analyser.frequencyBinCount)
    analysisFrameRef.current = { analyser, data: frequencyDataRef.current }
    return context
  }, [])

  const togglePlayback = useCallback(async () => {
    setHasInteracted(true)
    const audio = ensureAudio()
    const context = ensureAudioGraph(audio)

    if (!audio.paused) {
      audio.pause()
      return
    }

    if (context.state === "suspended") await context.resume()

    try {
      await audio.play()
    } catch {
      setIsPlaying(false)
    }
  }, [ensureAudio, ensureAudioGraph])

  const readAnalysisFrame = useCallback(() => {
    const frame = analysisFrameRef.current
    if (!frame) return null
    frame.analyser.getByteFrequencyData(frame.data)
    return frame
  }, [])

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = PORTFOLIO_TRACK.volume
  }, [])

  useEffect(() => () => {
    const audio = audioRef.current
    audio?.pause()
    void contextRef.current?.close()
    sourceRef.current = null
    analyserRef.current = null
    frequencyDataRef.current = null
    analysisFrameRef.current = null
  }, [])

  const value = useMemo(
    () => ({ hasInteracted, isPlaying, togglePlayback, readAnalysisFrame, intensityRef }),
    [hasInteracted, isPlaying, togglePlayback, readAnalysisFrame]
  )

  return (
    <PortfolioAudioContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        src={PORTFOLIO_TRACK.src}
        loop
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        aria-hidden="true"
      />
    </PortfolioAudioContext.Provider>
  )
}

export function usePortfolioAudio() {
  const value = useContext(PortfolioAudioContext)
  if (!value) throw new Error("usePortfolioAudio must be used inside AudioProvider")
  return value
}
