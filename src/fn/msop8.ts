import type {
    AnySoupElement,
    PcbFabricationNoteText,
    PcbSilkscreenPath,
  } from "circuit-json"
  import { z } from "zod"
  import { rectpad } from "../helpers/rectpad"
  import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"
  import { length } from "circuit-json"
  
  export const msop8_def = z.object({
    fn: z.string(),
    num_pins: z.literal(8).default(8),
    w: z.string().default("3.10mm"),
    h: z.string().default("3.32mm"),
    p: z.string().default("0.65mm"),
    pl: z.string().default("1.63mm"),
    pw: z.string().default("0.4mm"),
  })
  
  export const msop8 = (
    raw_params: z.input<typeof msop8_def>,
  ): { circuitJson: AnySoupElement[]; parameters: any } => {
    const parameters = msop8_def.parse(raw_params)
  
    const pad_spacing = length.parse(parameters.p)
  
    const silkscreenRefText: SilkscreenRef = silkscreenRef(
      0,
      length.parse(parameters.h) / 2 + 0.5,
      0.3,
    )
  
    const silkscreenBoxWidth = length.parse(parameters.w)
    const silkscreenBoxHeight = length.parse(parameters.h)
  
    const silkscreenTopLine: PcbSilkscreenPath = {
      type: "pcb_silkscreen_path",
      layer: "top",
      pcb_component_id: "",
      route: [
        { x: -silkscreenBoxWidth / 2, y: silkscreenBoxHeight / 2 },
        { x: silkscreenBoxWidth / 2, y: silkscreenBoxHeight / 2 },
      ],
      stroke_width: 0.05,
      pcb_silkscreen_path_id: "",
    }
  
    const silkscreenBottomLine: PcbSilkscreenPath = {
      type: "pcb_silkscreen_path",
      layer: "top",
      pcb_component_id: "",
      route: [
        { x: -silkscreenBoxWidth / 2, y: -silkscreenBoxHeight / 2 },
        { x: silkscreenBoxWidth / 2, y: -silkscreenBoxHeight / 2 },
      ],
      stroke_width: 0.05,
      pcb_silkscreen_path_id: "",
    }
  
    const pin1Position = getMsop8PadCoord({ pn: 1, pad_spacing })
    const pin1MarkerPosition = {
      x: pin1Position.x - 0.8,
      y: pin1Position.y,
    }
  
    const pin1Marking: PcbSilkscreenPath = {
      type: "pcb_silkscreen_path",
      layer: "top",
      pcb_component_id: "pin_marker_1",
      route: [
        { x: pin1MarkerPosition.x - 0.4, y: pin1MarkerPosition.y },
        { x: pin1MarkerPosition.x - 0.7, y: pin1MarkerPosition.y + 0.3 },
        { x: pin1MarkerPosition.x - 0.7, y: pin1MarkerPosition.y - 0.3 },
        { x: pin1MarkerPosition.x - 0.4, y: pin1MarkerPosition.y },
      ],
      stroke_width: 0.05,
      pcb_silkscreen_path_id: "pin_marker_1",
    }
  
    return {
      circuitJson: getMsop8Pads(parameters, pad_spacing).concat(
        silkscreenTopLine as AnySoupElement,
        silkscreenBottomLine as AnySoupElement,
        silkscreenRefText as AnySoupElement,
        pin1Marking as AnySoupElement,
      ),
      parameters,
    }
  }
  
  // Get coordinates for MSOP-8 pads
  export const getMsop8PadCoord = (parameters: {
    pn: number
    pad_spacing: number
  }) => {
    const { pn, pad_spacing } = parameters
  
    const col = pn <= 4 ? -1 : 1
  
    const row = 1.5 - ((pn - 1) % 4)
  
    return {
      x: col * length.parse("2mm"), 
      y: row * pad_spacing,
    }
  }
  
  // Generate pads for MSOP-8
  export const getMsop8Pads = (
    parameters: z.infer<typeof msop8_def>,
    pad_spacing: number,
  ) => {
    const pads: AnySoupElement[] = []
  
    for (let i = 1; i <= parameters.num_pins; i++) {
      const { x, y } = getMsop8PadCoord({
        pn: i,
        pad_spacing,
      })
      pads.push(
        rectpad(
          i,
          x,
          y,
          Number.parseFloat(parameters.pl),
          Number.parseFloat(parameters.pw),
        ),
      )
    }
    return pads
  }
