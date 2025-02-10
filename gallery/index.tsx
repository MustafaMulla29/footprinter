import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import React, { useState, useCallback } from "react"
import ReactDOM from "react-dom/client"
import { fp } from "src/footprinter"
// @ts-ignore data is build during ci
import svgData from "./svgData"

interface Footprint {
  svgContent: string
  title: string
}

const FootprintCreator: React.FC = () => {
  const [definition, setDefinition] = useState("")
  const [generatedSvg, setGeneratedSvg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  // Generate the SVG based on the provided footprint definition.
  const generateFootprint = useCallback(async (input: string) => {
    setError("")
    setGeneratedSvg(null)

    if (!input.trim()) {
      setError("Please enter a footprint definition.")
      return
    }

    setLoading(true)
    try {
      const circuitJson = fp.string(input).circuitJson()
      const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
      setGeneratedSvg(svgContent)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Form submission triggers generation.
  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault()
    generateFootprint(definition)
  }

  // When a grid item is clicked, update the definition and generate its SVG.
  const handleFootprintClick = (footprint: Footprint) => {
    setDefinition(footprint.title)
    generateFootprint(footprint.title)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Allow generation on pressing Enter (without Shift).
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      generateFootprint(definition)
    }
  }

  return (
    <div className="font-sans m-0 p-0">
      <header className="m-3 flex items-center">
        <h1 className="m-0 text-xl">
          <a
            href="https://github.com/tscircuit/footprinter"
            className="no-underline text-blue-500"
          >
            @tscircuit/footprinter
          </a>
        </h1>
        <div className="ml-auto gap-2 flex items-center">
          <a
            href="https://github.com/tscircuit/footprinter"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              alt="GitHub stars"
              src="https://img.shields.io/github/stars/tscircuit/footprinter?styl=social"
              className="h-6"
            />
          </a>
          <div>
            <button
              className="p-2 text-sm text-white cursor-pointer bg-blue-500 rounded-md"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? "Cancel" : "Create footprint"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto">
        {/* Generation Form */}
        {isOpen && (
          <section className="text-center mb-10">
            <form
              onSubmit={handleGenerate}
            >
              <div 
              className="flex flex-col items-center"
              >

              <textarea
                placeholder="Enter footprint definition e.g: bga7_w8_h8_grid3x3_p1_missing(center,B1)"
                value={definition}
                onChange={(e) => setDefinition(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full max-w-3xl p-4 text-base rounded-lg border border-gray-300 mb-4 resize-y min-h-[100px]"
              />
              <button
                type="submit"
                className="py-2 px-4 text-sm text-white cursor-pointer bg-blue-500 rounded-md"
                disabled={loading}
              >
                {loading ? "Generating..." : "Generate Footprint"}
              </button>
              </div>

            </form>
            {error && (
              <p className="text-red-600 mt-2 text-center font-bold text-xl">
                {error}
              </p>
            )}
          </section>
        )}

        {/* Generated SVG Preview */}
        {generatedSvg && (
          <section className="bg-white p-5 rounded-lg shadow-lg mb-10 flex items-center justify-center flex-col w-fit mx-auto">
            <h2 className="m-0 mb-5 text-lg text-center">
              Generated Footprint
            </h2>
            <div dangerouslySetInnerHTML={{ __html: generatedSvg }} />
          </section>
        )}

        {/* Existing Footprints Grid */}
        <section className="mt-10">
          <h2 className="text-center text-xl mb-5">Existing Footprints</h2>
          <div className="flex flex-wrap justify-center">
            {svgData.map((footprint, index) => (
              <div
                key={index}
                className="relative shadow-lg rounded-md w-72 h-56 m-4 cursor-pointer"
                onClick={() => handleFootprintClick(footprint)}
              >
                <div
                  className="w-full h-full"
                  dangerouslySetInnerHTML={{
                    __html: footprint.svgContent,
                  }}
                />
                <div className="absolute bottom-2 left-2 right-2 text-xs overflow-hidden">
                  <p className="bg-white/70 p-1 m-0 break-words line-clamp-2 max-w-fit">
                    {footprint.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

const root = ReactDOM.createRoot(document.body!)
root.render(<FootprintCreator />)
