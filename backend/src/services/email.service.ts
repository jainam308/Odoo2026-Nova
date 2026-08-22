import nodemailer from 'nodemailer';
import { generateTripIcs } from './ics.generator';

interface EmailDeparturePackParams {
  trip: any;
  recipientEmails: string[];
  senderName?: string;
  customNote?: string;
  attachIcs?: boolean;
}

interface WelcomeEmailParams {
  email: string;
  firstName?: string;
}

let transporterInstance: nodemailer.Transporter | null = null;

async function getTransporter(): Promise<nodemailer.Transporter> {
  if (transporterInstance) return transporterInstance;

  // Check if explicit SMTP is configured in .env
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporterInstance = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    return transporterInstance;
  }

  // Fallback to auto-created Ethereal test SMTP in development
  try {
    const testAccount = await nodemailer.createTestAccount();
    transporterInstance = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('✉️ Initialized Ethereal Test Email Service:', testAccount.user);
    return transporterInstance;
  } catch (err) {
    console.warn('⚠️ Could not connect to Ethereal, using JSON transport fallback:', err);
    transporterInstance = nodemailer.createTransport({
      jsonTransport: true,
    });
    return transporterInstance;
  }
}

function buildDeparturePackHtml(trip: any, senderName: string = 'A fellow traveler', customNote?: string): string {
  const stops = trip.stops || [];
  const totalCost = Number(trip.estimated_cost) || 0;

  const stopsHtml = stops
    .map(
      (stop: any, idx: number) => `
      <div style="margin-bottom: 20px; border: 1px solid #E5E7EB; border-radius: 12px; overflow: hidden; background-color: #FFFFFF;">
        <div style="background-color: #0F6E6E; color: #FFFFFF; padding: 12px 18px; display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0; font-size: 16px; font-weight: 700;">Stop ${idx + 1}: ${stop.city_name}, ${stop.country}</h3>
          <span style="font-size: 12px; background: rgba(255,255,255,0.2); padding: 3px 8px; border-radius: 6px;">
            ${stop.start_date || ''} ${stop.end_date ? 'to ' + stop.end_date : ''}
          </span>
        </div>
        <div style="padding: 16px;">
          ${
            stop.activities && stop.activities.length > 0
              ? `
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
              <thead>
                <tr style="border-bottom: 1px solid #E5E7EB; color: #6B7280;">
                  <th style="padding: 8px 4px;">Activity</th>
                  <th style="padding: 8px 4px;">Time</th>
                  <th style="padding: 8px 4px;">Category</th>
                  <th style="padding: 8px 4px; text-align: right;">Cost</th>
                </tr>
              </thead>
              <tbody>
                ${stop.activities
                  .map(
                    (act: any) => `
                  <tr style="border-bottom: 1px solid #F3F4F6;">
                    <td style="padding: 8px 4px; font-weight: 600; color: #1F2937;">${act.name}</td>
                    <td style="padding: 8px 4px; color: #6B7280;">${act.scheduled_time || 'Flexible'}</td>
                    <td style="padding: 8px 4px;"><span style="background: #E6F4F4; color: #0F6E6E; font-size: 11px; padding: 2px 6px; border-radius: 4px;">${act.category || 'Sightseeing'}</span></td>
                    <td style="padding: 8px 4px; text-align: right; color: #FF7A59; font-weight: 700;">$${act.cost || 0}</td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          `
              : `<p style="color: #6B7280; font-size: 13px; margin: 0;">No activities scheduled yet for this stop.</p>`
          }
        </div>
      </div>
    `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${trip.name} — Departure Pack</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F9FAFB; margin: 0; padding: 24px; color: #1F2937;">
        <div style="max-width: 650px; margin: 0 auto; background: #FFFFFF; border-radius: 18px; border: 1px solid #E5E7EB; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.05);">
          
          <!-- Header Banner -->
          <div style="background: linear-gradient(135deg, #0F6E6E 0%, #2B8A8A 100%); padding: 32px 24px; text-align: center; color: #FFFFFF;">
            <div style="font-size: 28px; margin-bottom: 8px;">✈️ 🌍</div>
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.02em;">GlobeTrotter Departure Pack</h1>
            <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">Your complete offline-ready itinerary & calendar sync</p>
          </div>

          <!-- Trip Overview -->
          <div style="padding: 24px;">
            ${
              customNote
                ? `
              <div style="background-color: #FFF1EE; border-left: 4px solid #FF7A59; padding: 14px 18px; border-radius: 8px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 13px; color: #E85F3D; font-weight: 600;">Note from ${senderName}:</p>
                <p style="margin: 4px 0 0; font-size: 14px; color: #1F2937;">"${customNote}"</p>
              </div>
            `
                : ''
            }

            <div style="background-color: #F9FAFB; border-radius: 12px; padding: 18px; margin-bottom: 24px; border: 1px solid #E5E7EB;">
              <h2 style="margin: 0 0 6px; font-size: 20px; font-weight: 800; color: #0F6E6E;">${trip.name}</h2>
              <p style="margin: 0 0 12px; font-size: 14px; color: #6B7280;">${trip.description || 'Custom multi-city travel adventure.'}</p>
              <div style="display: flex; gap: 16px; font-size: 13px; color: #4B5563;">
                <span>📅 <strong>Dates:</strong> ${trip.start_date} → ${trip.end_date}</span>
                <span>📍 <strong>Stops:</strong> ${stops.length} Cities</span>
                <span>💰 <strong>Est. Budget:</strong> $${totalCost.toLocaleString()}</span>
              </div>
            </div>

            <!-- Day-by-Day Stops -->
            <h3 style="font-size: 16px; font-weight: 700; color: #1F2937; margin-bottom: 14px;">🗺️ Day-by-Day Schedule</h3>
            ${stopsHtml || '<p style="color: #6B7280;">No stops currently added.</p>'}

            <!-- Emergency / Offline Guide -->
            <div style="background-color: #F3F4F6; border-radius: 12px; padding: 16px; margin-top: 24px; font-size: 12px; color: #4B5563;">
              <h4 style="margin: 0 0 6px; font-size: 13px; font-weight: 700; color: #1F2937;">🆘 Essential Traveler's Note</h4>
              <p style="margin: 0 0 4px;">• <strong>Calendar Sync:</strong> The attached <code>itinerary.ics</code> file can be opened directly to import all stops & activities into Google Calendar or Apple Calendar.</p>
              <p style="margin: 0;">• <strong>Emergency Numbers:</strong> International Emergency: <strong>112</strong> | USA: <strong>911</strong> | Japan: <strong>110</strong>.</p>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin-top: 28px;">
              <a href="http://localhost:5173/trips/${trip.id}" style="background-color: #FF7A59; color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-size: 14px; font-weight: 700; display: inline-block; box-shadow: 0 3px 8px rgba(255,122,89,0.3);">
                Open Live Itinerary on GlobeTrotter
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #F9FAFB; border-top: 1px solid #E5E7EB; padding: 18px; text-align: center; font-size: 12px; color: #9CA3AF;">
            GlobeTrotter — Empowering Personalized Multi-City Travel Planning © 2026
          </div>
        </div>
      </body>
    </html>
  `;
}

export async function sendTripDeparturePack({
  trip,
  recipientEmails,
  senderName = 'GlobeTrotter Traveler',
  customNote,
  attachIcs = true,
}: EmailDeparturePackParams): Promise<{ success: boolean; previewUrl?: string; messageId?: string }> {
  const transporter = await getTransporter();
  const htmlContent = buildDeparturePackHtml(trip, senderName, customNote);

  const attachments: any[] = [];
  if (attachIcs) {
    const icsContent = generateTripIcs(trip);
    attachments.push({
      filename: `${trip.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-itinerary.ics`,
      content: icsContent,
      contentType: 'text/calendar; charset=utf-8; method=PUBLISH',
    });
  }

  const mailOptions = {
    from: `"GlobeTrotter" <no-reply@globetrotter.com>`,
    to: recipientEmails.join(', '),
    subject: `✈️ Trip Departure Pack: ${trip.name} (Itinerary & Calendar)`,
    html: htmlContent,
    attachments,
  };

  const info = await transporter.sendMail(mailOptions);
  const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;

  if (previewUrl) {
    console.log('✉️ Email Departure Pack Sent! Preview URL:', previewUrl);
  }

  return {
    success: true,
    messageId: info.messageId,
    previewUrl,
  };
}

export async function sendWelcomeEmail({
  email,
  firstName = 'Traveler',
}: WelcomeEmailParams): Promise<{ success: boolean; previewUrl?: string }> {
  try {
    const transporter = await getTransporter();
    const html = `
      <div style="font-family: sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #E5E7EB; border-radius: 16px;">
        <div style="background-color: #0F6E6E; color: white; padding: 20px; border-radius: 12px; text-align: center;">
          <h1 style="margin: 0; font-size: 22px;">Welcome to GlobeTrotter! 🌍</h1>
        </div>
        <div style="padding: 20px 0; color: #1F2937; font-size: 14px; line-height: 1.6;">
          <p>Hi ${firstName},</p>
          <p>Thank you for joining GlobeTrotter! Your ultimate personalized travel planning companion is ready.</p>
          <p>Here is what you can do right now:</p>
          <ul>
            <li>🎯 <strong>Discover Destinations:</strong> Explore curated global cities and activities.</li>
            <li>🗺️ <strong>Build Multi-City Itineraries:</strong> Organize stops, assign daily activities, and track budgets.</li>
            <li>✈️ <strong>Email Departure Packs:</strong> Sync all your trips to Google Calendar with one click.</li>
          </ul>
          <div style="text-align: center; margin: 24px 0;">
            <a href="http://localhost:5173/trips/new" style="background-color: #FF7A59; color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              Plan Your First Trip
            </a>
          </div>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"GlobeTrotter" <welcome@globetrotter.com>`,
      to: email,
      subject: `🎉 Welcome to GlobeTrotter, ${firstName}!`,
      html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
    return { success: true, previewUrl };
  } catch (err) {
    console.error('Failed to send welcome email:', err);
    return { success: false };
  }
}
