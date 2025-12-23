import { NextRequest, NextResponse } from "next/server";
import * as brevo from "@getbrevo/brevo";

interface EmailRequest {
  reservation: {
    id: string;
    seat_id: string;
    date: string;
    time_from: string;
    time_to: string;
    name: string;
    email: string;
    phone: string;
    passcode: string;
    is_active: boolean;
    menu_items: number[];
  };
  pdfBase64: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as EmailRequest;
    const { reservation, pdfBase64 } = body;

    // Initialize Brevo API
    const apiInstance = new brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(
      brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY || ''
    );

    // Prepare email
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    
    sendSmtpEmail.subject = `Your Reservation Confirmation - Table #${reservation.seat_id}`;
    sendSmtpEmail.sender = {
      name: process.env.BREVO_FROM_NAME || "Restaurant Reservations",
      email: process.env.BREVO_FROM_EMAIL || "ghaliwali@gmail.com"
    };
    sendSmtpEmail.to = [{ email: reservation.email, name: reservation.name }];
    sendSmtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          
          <!-- Header -->
          <div style="text-align: center; padding: 20px 0;">
            <h1 style="margin: 0; color: #dc2626; font-size: 24px;">Reservation Confirmed</h1>
            <p style="color: #6b7280; margin: 10px 0 0 0;">Your reservation details are attached as a PDF.</p>
          </div>
          
          <!-- Content -->
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; text-align: center;">
            <p style="margin: 0; color: #374151;">
              Hello <strong>${reservation.name}</strong>,
            </p>
            <p style="margin: 15px 0 0 0; color: #4b5563;">
              Your reservation for <strong>Table #${reservation.seat_id}</strong> has been confirmed.
            </p>
            <p style="margin: 10px 0 0 0; color: #4b5563;">
              Please find your reservation details in the attached PDF file.
            </p>
            
            <!-- Passcode highlight -->
            <div style="background-color: #fee2e2; border: 2px solid #dc2626; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #991b1b; font-size: 12px; font-weight: 600;">YOUR RESERVATION PASSCODE</p>
              <p style="margin: 5px 0 0 0; color: #dc2626; font-size: 32px; font-weight: bold; letter-spacing: 4px;">${reservation.passcode}</p>
            </div>
            
            <p style="margin: 20px 0 0 0; color: #dc2626; font-weight: 600;">
              📎 Reservation-${reservation.id}.pdf
            </p>
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; padding: 30px 0; color: #9ca3af; font-size: 12px;">
            <p style="margin: 0;">Thank you for your reservation!</p>
            <p style="margin: 5px 0 0 0;">Please arrive 10 minutes before your reservation time.</p>
          </div>
          
        </div>
      </body>
      </html>
    `;
    
    // Add PDF attachment
    sendSmtpEmail.attachment = [
      {
        content: pdfBase64,
        name: `Reservation-${reservation.id}.pdf`,
      }
    ];

    // Send email
    await apiInstance.sendTransacEmail(sendSmtpEmail);

    return NextResponse.json({
      success: true,
      message: "Confirmation email with PDF sent successfully",
    });
  } catch (error: any) {
    console.error("Brevo error:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to send confirmation email", 
        details: error.message || "Unknown error" 
      },
      { status: 500 }
    );
  }
}