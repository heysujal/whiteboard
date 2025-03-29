"use client";
import axios from "axios";
import { MinusIcon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
 

export default function Dashboard() {
    const [existingRooms, setExistingRooms] = useState([]);
    const [showForm, setShowForm] = useState(false)
    const [state, formAction, isPending] = useActionState(createNewRoom, {});
    const router = useRouter();



    // Define the async action for creating a new room
    async function createNewRoom(previousState, formData) {
        const roomName = formData.get("name");
        console.log(roomName)

        try {
            const { data } = await axios.post(
                `${process.env.BACKEND_URL}/room`, {
                    roomName: roomName
                }, 
                {
                    headers: {
                        Authorization: localStorage.getItem("token"),
                    },
                }
            );

            console.log('new Room', data)
            // Update the state with the new room
            setExistingRooms((prev) => [...prev, data?.room]);

            return { success: true, message: "Room created successfully!" };
        } catch (error) {
            console.log(error)
            return { success: false, message: "Failed to create room" };
        }
    }


    useEffect(() => {
        async function fetchExistingRooms() {
            try {
                const { data } = await axios.get(`${BACKEND_URL}/getrooms`, {
                    headers: {
                        Authorization: localStorage.getItem("token"),
                    },
                });

                setExistingRooms(data?.data);
            } catch (error) {
                console.error(error);
            }
        }

        fetchExistingRooms();
    }, []);

    return (
        <div className="max-w-4xl mx-auto p-6 overflow-visible">
            <div className="flex justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <button onClick={()=>  {localStorage.removeItem('token'); router.push('/')}} className="px-2 border border-black rounded-md">Logout</button>
            </div>
            {/* Create Room Section */}
            <div id="create-room" className="bg-white p-6 rounded-lg shadow-md mb-8">
                <button onClick={() => setShowForm(prev => !prev)} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4">
                   {showForm ? <MinusIcon size={20}/> :  <PlusIcon size={20} />}
                    <span className="font-semibold">Create New Room</span>
                </button>

              { showForm &&  <form action={formAction} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-gray-700 font-medium">
                            Room Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            placeholder="Enter Room Name"
                            required
                            className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className={`w-full p-2 text-white font-semibold rounded-lg ${
                            isPending ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                        }`}
                    >
                        {isPending ? "Creating..." : "Create Room"}
                    </button>
                </form>}
                {state?.message && (
                    <p
                        className={`mt-3 p-2 text-sm text-center rounded-md ${
                            state.success ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                        }`}
                    >
                        {state.message}
                    </p>
                )}
            </div>

            {/* Rooms List */}
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Your Rooms</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {existingRooms.length > 0 ? (
                    existingRooms.map((room) => (
                        <Card key={room.id} createdAt={room.createdAt} slug={room.slug} />
                    ))
                ) : (
                    <p className="text-gray-500">No rooms found.</p>
                )}
            </div>
        </div>
    );
}

const Card = ({ createdAt, slug }) => {
    const router = useRouter();

    const getRelativeTime = (utcTimeStamp) => {
        const now = new Date();
        const diffMs = now - new Date(utcTimeStamp);
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays > 0) {
            return `${diffDays} days ago`;
        } else {
            return "Today";
        }
    };

    return (
        <div onClick={() => {
            router.push(`canvas/${slug}`)
        }} className="bg-gray-100 p-4 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer">
            <h4 className="text-xl font-semibold text-gray-900">{slug}</h4>
            <p className="text-sm text-gray-600 mt-1">Created: {getRelativeTime(createdAt)}</p>
        </div>
    );
};
