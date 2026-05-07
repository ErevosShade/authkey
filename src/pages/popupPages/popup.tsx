import { useEffect , useState } from "react"
import { Separator } from "../../components/ui/separator"
import { Button } from "../../components/ui/button"
import { Lock ,ChartNoAxesCombined } from "lucide-react"
import {GridSmallBackground }from "../../components/ui/grid"
import Lottie from "lottie-react"
import lock from "@/lottieFiles/lock.json"
import { createRoot } from "react-dom/client"
import "@/index.css"

function Popup() {
  const [url,setUrl] = useState("")
  useEffect(()=>{
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      setUrl(tabs[0]?.url||"")
    })
  },[])
  const isLoggined = false
  // const handleRegister = () => {
  //   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  //     if (!tabs[0]?.id) return;

  //     chrome.scripting.executeScript({
  //       target: { tabId: tabs[0].id },
  //       files: ['backgroundscript.tsx'],
  //     });
  //   });
  // };

  return (
    <GridSmallBackground>
<div className="w-full h-full flex flex-col items-center  text-white gap-2 p-4 overflow-visible">
      <h1 className="text-white text-3xl font-extrabold font-sans ">AuthKey</h1>
      <p className="text-muted-foreground text-sm font-sans">A simple extension to manage your privacy</p>
      <Separator/>
      {
        isLoggined ? (
      <>
      <div className="rounded-[5%] shadow-[inset_11.11px_11.11px_17px_#131316,inset_-11.11px_-11.11px_17px_#1D1D20] bg-[linear-gradient(145deg,#121214,#1E1E22)] w-full h-30 flex items-center flex-col gap-2">
        <h1 className="text-white text-xl font-extrabold font-sans h-10">
          🌐Website
        </h1>
        <span className="text-md">
          {url}
        </span>
          <Button className="rounded-[7%] shadow-[inset_11.41px_11.41px_20px_#101012,inset_-11.41px_-11.41px_20px_#202024] bg-[linear-gradient(145deg,#1E1E22,#121214)] px-6 py-4">
            Lock
            </Button>
</div>

      <div className="rounded-[10%] shadow-[inset_11.11px_11.11px_17px_#131316,inset_-11.11px_-11.11px_17px_#1D1D20] bg-[linear-gradient(145deg,#121214,#1E1E22)] w-full h-70 mt-4 flex items-center flex-col gap-2 p-4">
        <h1 className="text-white text-xl font-extrabold font-sans h-10 flex items-center justify-around gap-2">
          <Lock />Your Protected Websites
        </h1>
        <ul className="w-full h-full overflow-y-auto overflow-x-hidden">
          {
            Array.from({length: 10}).map((_, i) => (
              <li key={i} className="my-5 w-full bg-zinc-600 px-8 py-2 rounded-md flex items-center justify-between">
                <span className="text-white text-md font-sans">
                  https://www.google.com 
                </span>
                <div>
                  <Button className="px-4 py-2 rounded-md">Unlock</Button>
                </div>
              </li>
            ))
          }
        </ul>
</div>
<div className="rounded-[5%] shadow-[inset_11.41px_11.41px_20px_#101012,inset_-11.41px_-11.41px_20px_#202024] bg-[linear-gradient(145deg,#1E1E22,#121214)] px-6 py-4 w-full h-20 flex items-center justify-around gap-2">
  <ChartNoAxesCombined className="w-10 h-10 text-white" />
<span className="text-3xl font-extrabold font-sans">0</span>
<span className="text-lg font-semibold text-muted-foreground font-stretch-extra-condensed ">times Unlocked Today</span>
</div>
    </>
        ):(
          <>
          <Lottie
          animationData={lock}
          loop={true}
          autoplay={true}
          className="w-1/2 h-1/2 opacity-80 brightness-[0.2] grayscale mask-[radial-gradient(circle_at_center,black_0%,transparent_80%)]"
          />
          <h1 className="text-white text-2xl font-extrabold font-sans text-wrap-balance text-center">
            Set up your passcode to use AuthKey
          </h1>
          <Button className="mt-4 px-10 py-7 rounded-md cursor-pointer" onClick={()=>chrome.runtime.openOptionsPage()}>
            Set up passcode
            </Button>
          </>
                )
      }
        </div>
    </GridSmallBackground>
    
  )
}
createRoot(
  document.getElementById('root')!
).render(
  <Popup/>
)