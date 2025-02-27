import React, { Component, useEffect, useState } from "react"
import { MemoryRouter } from "react-router"
import {
  EMPTY_FILTER_TERM,
  FilterLevel,
  FilterSet,
  FilterSource,
} from "./logfilters"
import LogStore, { LogStoreProvider } from "./LogStore"
import OverviewLogPane from "./OverviewLogPane"
import { appendLines } from "./testlogs"
import { LogLevel } from "./types"

export default {
  title: "New UI/Overview/OverviewLogPane",
  decorators: [
    (Story: any) => (
      <MemoryRouter initialEntries={["/"]}>
        <div
          style={{
            margin: "-1rem",
            height: "80vh",
            width: "80vw",
            border: "thin solid #ccc",
          }}
        >
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
}

let defaultFilter: FilterSet = {
  source: FilterSource.all,
  level: FilterLevel.all,
  term: EMPTY_FILTER_TERM,
}

export const ThreeLines = () => {
  let logStore = new LogStore()
  appendLines(logStore, "fe", "line 1\n", "line2\n", "line3\n")
  return (
    <LogStoreProvider value={logStore}>
      <OverviewLogPane manifestName="fe" filterSet={defaultFilter} />
    </LogStoreProvider>
  )
}

export const ThreeLinesAllLog = () => {
  let logStore = new LogStore()
  appendLines(logStore, "", "line 1\n", "line2\n", "line3\n")
  return (
    <LogStoreProvider value={logStore}>
      <OverviewLogPane manifestName="" filterSet={defaultFilter} />
    </LogStoreProvider>
  )
}

export const ManyLines = (args: any) => {
  let logStore = new LogStore()
  let lines = []
  for (let i = 0; i < args.count; i++) {
    lines.push(`line ${i}\n`)
  }
  appendLines(logStore, "fe", lines)
  return (
    <LogStoreProvider value={logStore}>
      <OverviewLogPane manifestName="fe" filterSet={defaultFilter} />
    </LogStoreProvider>
  )
}
ManyLines.args = {
  count: 1000,
}
ManyLines.argTypes = {
  count: { control: { type: "number" } },
}

export const StyledLines = () => {
  let logStore = new LogStore()
  let lines = [
    "Black: \u001b[30m text \u001b[0m\n",
    "Red: \u001b[31m text \u001b[0m\n",
    "Green: \u001b[32m text \u001b[0m\n",
    "Yellow: \u001b[33m text \u001b[0m\n",
    "Blue: \u001b[34m text \u001b[0m\n",
    "Magenta: \u001b[35m text \u001b[0m\n",
    "Cyan: \u001b[36m text \u001b[0m\n",
    "White: \u001b[37m text \u001b[0m\n",
    "Bright Black: \u001b[90m text \u001b[0m\n",
    "Bright Red: \u001b[91m text \u001b[0m\n",
    "Bright Green: \u001b[92m text \u001b[0m\n",
    "Bright Yellow: \u001b[93m text \u001b[0m\n",
    "Bright Blue: \u001b[94m text \u001b[0m\n",
    "Bright Magenta: \u001b[95m text \u001b[0m\n",
    "Bright Cyan: \u001b[96m text \u001b[0m\n",
    "Bright White: \u001b[97m text \u001b[0m\n",
    "Black BG: \u001b[40m text \u001b[0m\n",
    "Red BG: \u001b[41m text \u001b[0m\n",
    "Green BG: \u001b[42m text \u001b[0m\n",
    "Yellow BG: \u001b[43m text \u001b[0m\n",
    "Blue BG: \u001b[44m text \u001b[0m\n",
    "Magenta BG: \u001b[45m text \u001b[0m\n",
    "Cyan BG: \u001b[46m text \u001b[0m\n",
    "White BG: \u001b[47m text \u001b[0m\n",
    "Bright Black BG: \u001b[100m text \u001b[0m\n",
    "Bright Red BG: \u001b[101m text \u001b[0m\n",
    "Bright Green BG: \u001b[102m text \u001b[0m\n",
    "Bright Yellow BG: \u001b[103m text \u001b[0m\n",
    "Bright Blue BG: \u001b[104m text \u001b[0m\n",
    "Bright Magenta BG: \u001b[105m text \u001b[0m\n",
    "Bright Cyan BG: \u001b[106m text \u001b[0m\n",
    "Bright White BG: \u001b[107m text \u001b[0m\n",
    "Link: https://tilt.dev/\n",
    'Escaped Link: <a href="https://tilt.dev/" >Tilt</a>\n',
    'Escaped Button: <button onClick="alert(\\"you are p0wned\\")" >Tilt</button>\n',
  ]
  appendLines(logStore, "fe", ...lines)
  return (
    <LogStoreProvider value={logStore}>
      <OverviewLogPane manifestName="fe" filterSet={defaultFilter} />
    </LogStoreProvider>
  )
}

export const BuildEventLines = () => {
  let logStore = new LogStore()
  let lines = [
    { text: "Start build\n", fields: { buildEvent: "init" } },
    { text: "Fallback build 1\n", fields: { buildEvent: "fallback" } },
    { text: "Fallback build 2\n", fields: { buildEvent: "fallback" } },
    { text: "Fallback build 3\n", fields: { buildEvent: "fallback" } },
    "Build log 1\n",
    "Build log 2\n",
  ]
  appendLines(logStore, "fe", ...lines)
  return (
    <LogStoreProvider value={logStore}>
      <OverviewLogPane manifestName="fe" filterSet={defaultFilter} />
    </LogStoreProvider>
  )
}

export const BuildFallbackLines = () => {
  let logStore = new LogStore()
  let lines = [
    { text: "Start build\n", fields: { buildEvent: "init" } },
    "Build log 1\n",
    "Build log 2\n",
    { text: "Fallback build 1\n", fields: { buildEvent: "fallback" } },
    { text: "Fallback build 2\n", fields: { buildEvent: "fallback" } },
    { text: "Fallback build 3\n", fields: { buildEvent: "fallback" } },
    "Build log 3\n",
    "Build log 4\n",
  ]
  appendLines(logStore, "fe", ...lines)
  return (
    <LogStoreProvider value={logStore}>
      <OverviewLogPane manifestName="fe" filterSet={defaultFilter} />
    </LogStoreProvider>
  )
}

export const BuildFallbackLinesLong = () => {
  let logStore = new LogStore()
  let lines = [
    { text: "Start build\n", fields: { buildEvent: "init" } },
    "Build log 1\n",
    "Build log 2\n",
    {
      text: "Fallback build 1 Fallback build 1 Fallback build 1 Fallback build 1 Fallback build 1 Fallback build 1 Fallback build 1 Fallback build 1\n",
      fields: { buildEvent: "fallback" },
    },
    {
      text: "Fallback build 2 Fallback build 2 Fallback build 2 Fallback build 2 Fallback build 2 Fallback build 2 Fallback build 2 Fallback build 2\n",
      fields: { buildEvent: "fallback" },
    },
    {
      text: "Fallback build 3 Fallback build 3 Fallback build 3 Fallback build 3 Fallback build 3 Fallback build 3 Fallback build 3 Fallback build 3 Fallback build 3\n",
      fields: { buildEvent: "fallback" },
    },
    "Build log 3\n",
    "Build log 4\n",
  ]
  appendLines(logStore, "fe", ...lines)
  return (
    <LogStoreProvider value={logStore}>
      <OverviewLogPane manifestName="fe" filterSet={defaultFilter} />
    </LogStoreProvider>
  )
}

export const ProgressLines = (args: any) => {
  let [logStore, setLogStore] = useState(new LogStore())
  let lines = [
    { text: "Start build\n", fields: { progressID: "start" } },
    { text: `Layer 1: 0%\n`, fields: { progressID: "layer1" } },
    { text: `Layer 2: 0%\n`, fields: { progressID: "layer2" } },
    { text: `Layer 3: 0%\n`, fields: { progressID: "layer3" } },
    { text: `Layer 4: 0%\n`, fields: { progressID: "layer4" } },
  ]
  appendLines(logStore, "fe", ...lines)

  useEffect(() => {
    let lines = [
      { text: "Start build\n", fields: { progressID: "start" } },
      { text: `Layer 1: ${args.layer1}%\n`, fields: { progressID: "layer1" } },
      { text: `Layer 2: ${args.layer2}%\n`, fields: { progressID: "layer2" } },
      { text: `Layer 3: ${args.layer3}%\n`, fields: { progressID: "layer3" } },
      { text: `Layer 4: ${args.layer4}%\n`, fields: { progressID: "layer4" } },
    ]
    appendLines(logStore, "fe", ...lines)
  }, [args])

  return (
    <LogStoreProvider value={logStore}>
      <OverviewLogPane manifestName="fe" filterSet={defaultFilter} />
    </LogStoreProvider>
  )
}

ProgressLines.args = {
  layer1: 50,
  layer2: 40,
  layer3: 30,
  layer4: 20,
}
ProgressLines.argTypes = {
  layer1: { control: { type: "number", min: 0, max: 100 } },
  layer2: { control: { type: "number", min: 0, max: 100 } },
  layer3: { control: { type: "number", min: 0, max: 100 } },
  layer4: { control: { type: "number", min: 0, max: 100 } },
}

type ForeverLogProps = {
  // Starting lines in the component.
  startCount: number

  // Incremental lines on each timer tick.
  incCount: number
}

class ForeverLogComponent extends Component<ForeverLogProps> {
  logStore = new LogStore()
  lineCount = 0
  timer: any

  appendLines(count: number) {
    let lines = []
    for (let i = 0; i < count; i++) {
      lines.push({ text: `Line #${this.lineCount++}\n` })
    }
    appendLines(this.logStore, "fe", lines)
  }

  componentDidMount() {
    this.appendLines(this.props.startCount)

    this.timer = setInterval(() => {
      this.appendLines(this.props.incCount)
    }, 1000)
  }

  componentWillUnmount() {
    clearInterval(this.timer)
  }

  render() {
    return (
      <LogStoreProvider value={this.logStore}>
        <OverviewLogPane manifestName="fe" filterSet={defaultFilter} />
      </LogStoreProvider>
    )
  }
}

export const ForeverLog = (args: ForeverLogProps) => {
  return <ForeverLogComponent {...args} />
}
ForeverLog.args = {
  startCount: 1000,
  incCount: 5,
}
ForeverLog.argTypes = {
  startCount: { control: { type: "number" } },
  incCount: { control: { type: "number" } },
}

export const BuildLogAndRunLog = (args: any) => {
  let logStore = new LogStore()
  let segments = []
  for (let i = 0; i < 20; i++) {
    let level = ""
    let lineType = "build"
    if (i === 15) {
      level = LogLevel.WARN
      lineType = "build warning"
    } else if (i === 19) {
      level = LogLevel.ERROR
      lineType = "build error"
    }
    segments.push({
      spanId: "build:1",
      text: `Vigoda ${lineType} line ${i}\n`,
      time: new Date().toString(),
      level,
    })
  }
  for (let i = 0; i < 20; i++) {
    let level = ""
    let lineType = "pod"
    if (i === 15) {
      level = LogLevel.WARN
      lineType = "pod warning"
    } else if (i === 19) {
      level = LogLevel.ERROR
      lineType = "pod error"
    }
    segments.push({
      spanId: "pod:1",
      text: `Vigoda ${lineType} line ${i}\n`,
      time: new Date().toString(),
      level,
    })
  }
  logStore.append({
    spans: {
      "build:1": { manifestName: "vigoda_1" },
      "pod:1": { manifestName: "vigoda_1" },
    },
    segments: segments,
  })

  return (
    <LogStoreProvider value={logStore}>
      <OverviewLogPane
        manifestName={"vigoda_1"}
        filterSet={{
          source: args.source,
          level: args.level,
          term: args.term || EMPTY_FILTER_TERM,
        }}
      />
    </LogStoreProvider>
  )
}

BuildLogAndRunLog.args = {
  source: "",
  level: "",
  term: EMPTY_FILTER_TERM,
}

BuildLogAndRunLog.argTypes = {
  source: {
    name: "Source",
    control: {
      type: "select",
      options: [FilterSource.all, FilterSource.build, FilterSource.runtime],
    },
  },
  level: {
    name: "Level",
    control: {
      type: "select",
      options: [FilterLevel.all, FilterLevel.warn, FilterLevel.error],
    },
  },
}
