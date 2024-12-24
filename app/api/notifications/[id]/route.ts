import { NextResponse } from "next/server";

// Mock data store - replace with actual database
let notifications = [
  {
    id: "1",
    title: "Welcome to Banking App",
    message: "Thank you for joining our banking platform!",
    type: "info",
    timestamp: new Date(),
    read: false
  },
  {
    id: "2",
    title: "New Transaction",
    message: "You have received a payment of $500",
    type: "success",
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    read: false
  }
];

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const notification = notifications.find(n => n.id === params.id);
    
    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ notification }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch notification" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const initialLength = notifications.length;
    notifications = notifications.filter(n => n.id !== params.id);

    if (notifications.length === initialLength) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Notification deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const notification = notifications.find(n => n.id === params.id);
    
    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    Object.assign(notification, body);
    
    return NextResponse.json(
      { notification },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
} 