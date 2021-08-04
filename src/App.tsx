import { Form, Select } from 'antd'
import React from 'react'
import Webcam from 'react-webcam'

interface ExtendedHTMLVideoElement extends HTMLVideoElement {
  requestVideoFrameCallback(callback: () => void): number
}

const App = () => {
  const [deviceId, setDeviceId] = React.useState("")
  const [devices, setDevices] = React.useState<MediaDeviceInfo[]>([])
  const webcamRef = React.useRef<Webcam>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  const handleSelectDevice = (selectedId: string) => {
    setDeviceId(selectedId)
  }

  const handleDevices = React.useCallback(
    (mediaDevices: MediaDeviceInfo[]) => {
      setDevices(mediaDevices.filter(({ kind }) => kind === "videoinput"))
    }, [setDevices]
  );

  React.useEffect(
    () => {
      navigator.mediaDevices.enumerateDevices().then(handleDevices);
    },
    [handleDevices]
  );

  const onStreamChanged = (stream: MediaStream) => {
    const tracks = stream.getVideoTracks()
    if (tracks.length > 0) {
      const id = tracks[0].getSettings().deviceId
      if (id) {
        setDeviceId(id)
      }
    }

    if(devices.length === 1 && devices[0].deviceId === "") {
      navigator.mediaDevices.enumerateDevices().then(handleDevices);
    }
  }

  const render = () => {
    if (!webcamRef.current) return
    if (!canvasRef.current) return

    const video = webcamRef.current.video!
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvasRef.current.getContext('2d')!
    ctx.drawImage(video, 0, 0)
    ctx.moveTo(0, 0)
    ctx.lineTo(canvas.width, canvas.height)
    ctx.stroke()

    ;(webcamRef.current.video as any).requestVideoFrameCallback(render)
  }

  React.useEffect(
    () => {
      if (webcamRef.current) {
        const video = webcamRef.current.video! as ExtendedHTMLVideoElement
        video.requestVideoFrameCallback(render)
      }
    }
  )

  return (
    <>
      <p>selected: {deviceId}</p>
      <Form>
        <Form.Item label="device">
          <Select onSelect={handleSelectDevice} value={deviceId}>
            {devices.map((device, key) => (
              <Select.Option key={device.deviceId} value={device.deviceId}>{device.label}</Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
      <Webcam
        videoConstraints={{deviceId: deviceId, width: 640, height: 480}}
        audio={false}
        onUserMedia={onStreamChanged}
        ref={webcamRef}
        className="input"
      ></Webcam>
      <canvas id="output" ref={canvasRef} className="output"></canvas>
    </>
  );
};
export default App
