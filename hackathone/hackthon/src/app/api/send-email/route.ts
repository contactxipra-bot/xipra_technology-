import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';

const getFilePath = (fileName: string) => {
  return path.join(process.cwd(), 'public', fileName);
};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'contactxipra@gmail.com',
    pass: 'hdul khjo loxz jvyb'
  }
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, email, teamName, teamNumber, domain, pdfBase64, name, memberCount, totalFee, perMember, transactionId } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    let mailOptions: any = {
      from: '"Hacknexus Team" <contactxipra@gmail.com>',
      to: email
    };
    mailOptions.attachments = [];

    if (type === 'approval') {
      mailOptions.subject = `Congratulations! Your team ${teamName} is Approved for Hacknexus! 🎉`;
      mailOptions.html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <div style="text-align: center; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 2px solid #f0f0f0;">
            <h1 style="color: #4f46e5; margin: 0; font-size: 2.5rem; letter-spacing: 2px;">HACKNEXUS</h1>
            <h3 style="color: #64748b; margin-top: 10px; font-weight: normal;">Organized by <strong>Wiregen AI</strong> & <strong>Xipra Technology</strong></h3>
          </div>
          
          <h2 style="color: #4f46e5;">Congratulations, Team ${teamName}!</h2>
          <p>We are thrilled to inform you that your registration for <strong>Hacknexus</strong> has been officially approved!</p>
          
          <div style="background: #f8fafc; padding: 15px; border-left: 4px solid #ec4899; margin: 20px 0;">
            <p><strong>Team ID:</strong> <span style="font-size: 1.2em; font-family: monospace; font-weight: bold; color: #ec4899;">${teamNumber || 'N/A'}</span></p>
            <p><strong>Selected Domain:</strong> ${domain}</p>
            <p><strong>Status:</strong> Approved ✅</p>
          </div>
          
          <h3 style="margin-top: 30px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Payment Invoice Details</h3>
          <table style="width: 100%; max-width: 500px; border-collapse: collapse; margin-top: 10px; margin-bottom: 20px; background: #fff;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #555;"><strong>Transaction ID (UTR):</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-family: monospace;">${transactionId || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #555;"><strong>Team Members:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${memberCount || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #555;"><strong>Cost per Member:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${perMember || '0'}</td>
            </tr>
            <tr style="background-color: #f9fafb;">
              <td style="padding: 12px 10px; font-weight: bold; color: #111827; border-bottom: 2px solid #ddd;">Total Paid:</td>
              <td style="padding: 12px 10px; font-weight: bold; color: #10b981; text-align: right; border-bottom: 2px solid #ddd; font-size: 1.1em;">₹${totalFee || '0'}</td>
            </tr>
          </table>

          <h3>Important Details:</h3>
          <ul>
            <li><strong>Hackathon Start:</strong> (TBA - Please check your portal)</li>
            <li><strong>Result Declaration:</strong> Will be announced post-evaluation</li>
            <li><strong>Next Steps:</strong> Start preparing your environment and collaborating with your team!</li>
          </ul>
          
          <p>We are excited to see the innovative solutions you will build.</p>
          <p>Best regards,<br/><strong>Wiregen AI & Xipra Technology Team</strong></p>
        </div>
      `;
    } else if (type === 'registration') {
      mailOptions.subject = `Registration Received - Team ${teamName} | Hacknexus`;
      
      // If a PDF was attached (e.g. invoice), add it
      if (pdfBase64) {
        mailOptions.attachments.push({
          filename: `Hacknexus_Invoice_${teamName}.pdf`,
          content: pdfBase64.split(',')[1] || pdfBase64,
          encoding: 'base64'
        });
      }

      mailOptions.html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <div style="text-align: center; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 2px solid #f0f0f0;">
            <h1 style="color: #4f46e5; margin: 0; font-size: 2.5rem; letter-spacing: 2px;">HACKNEXUS</h1>
            <h3 style="color: #64748b; margin-top: 10px; font-weight: normal;">Organized by <strong>Wiregen AI</strong> & <strong>Xipra Technology</strong></h3>
          </div>
          
          <h2 style="color: #4f46e5;">Registration Received!</h2>
          <p>Dear ${name || 'Participant'},</p>
          <p>We have received your registration and payment for <strong>Hacknexus</strong>. Your registration is currently <strong>Under Review</strong>.</p>
          
          <div style="background: #f8fafc; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0;">
            <p style="margin: 0; font-size: 1.1em;"><strong>Your Unique Team ID:</strong></p>
            <p style="margin: 10px 0; font-size: 1.8em; font-family: monospace; font-weight: bold; color: #3b82f6; letter-spacing: 2px;">${teamNumber || 'N/A'}</p>
            <p style="margin: 0; font-size: 0.9em; color: #666;">(Save this ID to access the Student Portal)</p>
          </div>
          
          <h3 style="margin-top: 30px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Payment Invoice Details</h3>
          <table style="width: 100%; max-width: 500px; border-collapse: collapse; margin-top: 10px; margin-bottom: 20px; background: #fff;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #555;"><strong>Team Name:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${teamName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #555;"><strong>Team Members:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${memberCount || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #555;"><strong>Cost per Member:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${perMember || '0'}</td>
            </tr>
            <tr style="background-color: #f9fafb;">
              <td style="padding: 12px 10px; font-weight: bold; color: #111827; border-bottom: 2px solid #ddd;">Total Paid:</td>
              <td style="padding: 12px 10px; font-weight: bold; color: #10b981; text-align: right; border-bottom: 2px solid #ddd; font-size: 1.1em;">₹${totalFee || '0'}</td>
            </tr>
          </table>

          <p>We will review your payment screenshot and send you an Approval email shortly.</p>
          <p>Best regards,<br/><strong>Wiregen AI & Xipra Technology Team</strong></p>
        </div>
      `;
    } else if (type === 'certificate') {
      mailOptions.subject = `Your Hacknexus Certificate is Here! 🏆`;
      mailOptions.html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <div style="text-align: center; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 2px solid #f0f0f0;">
            <h1 style="color: #4f46e5; margin: 0; font-size: 2.5rem; letter-spacing: 2px;">HACKNEXUS</h1>
            <h3 style="color: #64748b; margin-top: 10px; font-weight: normal;">Organized by <strong>Wiregen AI</strong> & <strong>Xipra Technology</strong></h3>
          </div>
          
          <h2 style="color: #ec4899;">Congratulations, ${name}!</h2>
          <p>Thank you for participating in <strong>Hacknexus</strong>. Your dedication and hard work have been truly inspiring.</p>
          <p>Please find your official certificate of participation attached to this email.</p>
          <p>We wish you the best in your future endeavors!</p>
          <p>Best regards,<br/><strong>Wiregen AI & Xipra Technology Team</strong></p>
        </div>
      `;
      
      if (pdfBase64) {
        const base64Data = pdfBase64.split(';base64,').pop();
        mailOptions.attachments.push({
          filename: `${name.replace(/\s+/g, '_')}_Certificate.pdf`,
          content: base64Data,
          encoding: 'base64'
        });
      }
    } else {
      return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
    }

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true, message: 'Email sent successfully!' });
    
  } catch (error: any) {
    console.error('Email error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
  }
}
