import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
  menuItems?: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  totalAmount?: number;
  pdfBase64: string; // Base64 encoded PDF
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as EmailRequest;
    const { reservation, pdfBase64 } = body;

    // Send email with ONLY the PDF attachment
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: reservation.email,
      subject: `Your Reservation Confirmation - Table #${reservation.seat_id}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            
            <!-- Simple header -->
            <div style="text-align: center; padding: 20px 0;">
              <h1 style="margin: 0; color: #dc2626; font-size: 24px;">Reservation Confirmed</h1>
              <p style="color: #6b7280; margin: 10px 0 0 0;">Your reservation details are attached as a PDF.</p>
            </div>
            
            <!-- Minimal content -->
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; text-align: center;">
              <p style="margin: 0; color: #374151;">
                Hello <strong>${reservation.name}</strong>,
              </p>
              <p style="margin: 15px 0 0 0; color: #4b5563;">
                Your reservation for Table #${reservation.seat_id} has been confirmed.
              </p>
              <p style="margin: 10px 0 0 0; color: #4b5563;">
                Please find your reservation details in the attached PDF file.
              </p>
              <p style="margin: 20px 0 0 0; color: #dc2626; font-weight: 600;">
                📎 Reservation-${reservation.id}.pdf
              </p>
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; padding: 30px 0; color: #9ca3af; font-size: 12px;">
              <p style="margin: 0;">Thank you for your reservation!</p>
            </div>
            
          </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: `Reservation-${reservation.id}.pdf`,
          content: pdfBase64,
        },
      ],
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send confirmation email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Confirmation email with PDF sent successfully",
      emailId: data?.id,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}