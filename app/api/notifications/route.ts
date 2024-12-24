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

export async function GET() {
  try {
    // Sort notifications by timestamp, newest first
    const sortedNotifications = [...notifications].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    return NextResponse.json({ notifications: sortedNotifications }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newNotification = {
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
      ...body
    };
    
    notifications.push(newNotification);
    
    return NextResponse.json(
      { notification: newNotification },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
} 