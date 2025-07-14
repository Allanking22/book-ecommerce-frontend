// app/api/send-welcome-email/route.js
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const { recipientEmail, recipientName } = await request.json();

    // Create a Nodemailer transporter using your Gmail account
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_EMAIL, // Your Gmail address from .env.local
        pass: process.env.GMAIL_APP_PASSWORD, // Your generated App Password from .env.local
      },
    });

    // --- Welcome Email Content (Anime/Comics Aesthetic) ---
    const welcomeHtml = `
      <div style="font-family: 'Arial', sans-serif; background-color: #fce4ec; padding: 20px; text-align: center; border-radius: 10px; max-width: 600px; margin: auto; border: 2px solid #ff4081;">
        <img
          src="https://cdn.pixabay.com/photo/2023/04/14/23/06/ai-generated-7926621_640.jpg"
          alt="MangaVerse Welcome Banner"
          style="max-width: 100%; height: auto; display: block; margin: 0 auto; border-radius: 8px; margin-bottom: 20px;"
        >
        <h1 style="color: #673ab7; font-size: 30px; margin-bottom: 10px; font-weight: bold; text-shadow: 1px 1px 2px #f48fb1;">
          Konnichiwa, ${recipientName}!
        </h1>
        <p style="color: #424242; font-size: 18px; line-height: 1.6;">
          Welcome to the <strong style="color: #ff4081;">MangaVerse</strong>, where your epic adventure begins!
          You've just unlocked your gateway to countless worlds and stories.
        </p>
        <p style="color: #424242; font-size: 16px; line-height: 1.5;">
          Prepare for a quest filled with thrilling narratives, unforgettable characters, and endless volumes to explore.
        </p>
        <a href="http://localhost:3000/" style="display: inline-block; background-color: #ff4081; color: white; padding: 12px 25px; border-radius: 25px; text-decoration: none; font-weight: bold; margin-top: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          Begin Your Manga Journey!
        </a>
        <p style="color: #757575; font-size: 14px; margin-top: 30px;">
          Happy Reading, fellow Otaku!
        </p>
        <img src="https://example.com/your-chibi-mascot.png" alt="Chibi Mascot" style="height: 50px; margin-top: 15px;"> <p style="color: #9e9e9e; font-size: 12px;">
          © ${new Date().getFullYear()} MangaVerse. All rights reserved.
        </p>
      </div>
    `;

    const mailOptions = {
      from: process.env.GMAIL_EMAIL, // Your Gmail address (sender)
      to: recipientEmail, // The recipient's email
      subject: 'Welcome to MangaVerse! Your Adventure Begins!', // Email subject
      html: welcomeHtml, // The HTML content of the email
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'Welcome email sent successfully!' }, { status: 200 });

  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Return a 500 status if there's an error sending the email
    return NextResponse.json({ message: 'Failed to send welcome email.' }, { status: 500 });
  }
}