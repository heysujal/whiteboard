import { CircleIcon, HomeIcon, Minus, RectangleHorizontalIcon } from "lucide-react";
import { IconButton } from "./IconButton"
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function TopMenuBar({canvasRef}){
    const router = useRouter();
    const [selectedShape, setSelectedShape] = useState('rectangle');
    const handleShapeSelect = (e) => {
        const clickedShape = e.target.closest("button[id]")?.id;
        const event = new CustomEvent('shapeSelect', {detail: clickedShape});
        canvasRef?.current.dispatchEvent(event)
        setSelectedShape(clickedShape);
    }

    const iconList = [
        {
            id: 'rectangle',
            icon: <RectangleHorizontalIcon/>
        },
        {
            id: 'circle',
            icon: <CircleIcon/>
        },
        {
            id: 'line',
            icon: <Minus/>
        },

    ]

    return  (<div className="iconHolder absolute top-0 left-[45%]">

    <div onClick={handleShapeSelect} className="flex justify-around items-center ">


        {
            iconList?.map((item) => {
                return <IconButton isSelected={item.id === selectedShape} id={item.id} key={item.id} icon={item.icon}/>
            })
        }



        {/* <IconButton id="line" className="m-1 p-2 shadow-lg shadow-slate-400 rounded-sm cursor-pointer"> <Minus/> </div> */}
        {/* <IconButton hidden id="pen" className="m-1 p-2 shadow-lg shadow-slate-400 rounded-sm cursor-pointer"> <PenLineIcon/> </div> */}
        {/* <div id="eraser" className="m-1 p-2 shadow-lg shadow-slate-400 rounded-sm cursor-pointer"> <Eraser/> </div> */}
        {/* <div id="text" className="m-1 p-2 shadow-lg shadow-slate-400 rounded-sm cursor-pointer"> <Type/> </div> */}
        {/* <div id="arrow" className="m-1 p-2 shadow-lg shadow-slate-400 rounded-sm cursor-pointer"> <MoveUpRight /> </div> */}
        {/* <div id="undo" className="m-1 p-2 shadow-lg shadow-slate-400 rounded-sm cursor-pointer"> <Undo /> </div> */}
        {/* <div id="redo" className="m-1 p-2 shadow-lg shadow-slate-400 rounded-sm cursor-pointer"> <Redo /> </div> */}


    <button onClick={() => router.push(`/dashboard`)}  className="transition duration-100 cursor-pointer rounded-md border ml-5 p-2 shadow-lg shadow-slate-400 text-white bg-black hover:bg-gray-300 hover:text-black" > <HomeIcon/> </button>

    </div>
</div>)
}