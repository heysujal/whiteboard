"use client";
import axios from "axios";
import { MinusIcon, PlusIcon, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

interface Room {
    id: string;
    slug: string;
    createdAt: string;
}

export default function Dashboard() {
    const [existingRooms, setExistingRooms] = useState<Room[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [deletingRoomId, setDeletingRoomId] = useState<string | null>(null);
    const [state, formAction, isPending] = useActionState(createNewRoom, {
        success: false,
        message: ""
    });
    const router = useRouter();

    // Define the async action for creating a new room
    // @ts-expect-error: This needs to be fixed later
    async function createNewRoom(_previousState, formData) {
        const roomName = formData.get("name");
        console.log(roomName)

        try {
            const { data } = await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/room`, {
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

    const deleteRoom = async (roomId: string, roomSlug: string) => {
        if (!confirm(`Are you sure you want to delete the room "${roomSlug}"? This action cannot be undone.`)) {
            return;
        }

        setDeletingRoomId(roomId);
        
        try {
            await axios.delete(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/room/${roomId}`,
                {
                    headers: {
                        Authorization: localStorage.getItem("token"),
                    },
                }
            );

            // Remove the room from the local state
            setExistingRooms((prev) => prev.filter(room => room.id !== roomId));
        } catch (error) {
            console.error('Error deleting room:', error);
            alert('Failed to delete room. Please try again.');
        } finally {
            setDeletingRoomId(null);
        }
    };

    useEffect(() => {
        async function fetchExistingRooms() {
            try {
                const { data } = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/getrooms`, {
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
                        <Card 
                            key={room.id} 
                            room={room}
                            onDelete={deleteRoom}
                            isDeleting={deletingRoomId === room.id}
                        />
                    ))
                ) : (
                    <p className="text-gray-500">No rooms found.</p>
                )}
            </div>
        </div>
    );
}

interface CardProps {
    room: Room;
    onDelete: (roomId: string, roomSlug: string) => void;
    isDeleting: boolean;
}

const Card = ({ room, onDelete, isDeleting }: CardProps) => {
    const router = useRouter();

    const getRelativeTime = (utcTimeStamp: string) => {
        const now = new Date();
        const diffMs = now.getTime() - new Date(utcTimeStamp).getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays > 0) {
            return `${diffDays} days ago`;
        } else {
            return "Today";
        }
    };

    const handleCardClick = (e: React.MouseEvent) => {
        // Don't navigate if clicking on the delete button
        if ((e.target as HTMLElement).closest('.delete-button')) {
            return;
        }
        router.push(`canvas/${room.slug}`);
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(room.id, room.slug);
    };

    return (
        <div 
            onClick={handleCardClick} 
            className="bg-gray-100 p-4 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer relative group"
        >
            {/* Delete Button */}
            <button
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className="delete-button absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete room"
            >
                {isDeleting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                    <Trash2 size={16} />
                )}
            </button>

            {/* Room Info */}
            <h4 className="text-xl font-semibold text-gray-900 pr-8">{room.slug}</h4>
            <p className="text-sm text-gray-600 mt-1">Created: {getRelativeTime(room.createdAt)}</p>
            
            {/* Delete Confirmation Overlay */}
            {isDeleting && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                    <div className="bg-white p-3 rounded-lg flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-sm text-gray-700">Deleting...</span>
                    </div>
                </div>
            )}
        </div>
    );
};
