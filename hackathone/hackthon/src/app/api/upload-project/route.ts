import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import stream from 'stream';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const teamName = formData.get('teamName') as string;
    const teamNumber = formData.get('teamNumber') as string;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    // Initialize Google Drive API
    const credentialsPath = path.join(process.cwd(), 'google-credentials.json');
    const auth = new google.auth.GoogleAuth({
      keyFile: credentialsPath,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    const drive = google.drive({ version: 'v3', auth });
    
    const buffer = Buffer.from(await file.arrayBuffer());
    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);

    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    
    if (!folderId) {
      throw new Error("GOOGLE_DRIVE_FOLDER_ID is missing in .env.local");
    }

    const safeTeamName = teamName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `${teamNumber}_${safeTeamName}_${file.name}`;

    const driveResponse = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [folderId],
      },
      media: {
        mimeType: file.type || 'application/octet-stream',
        body: bufferStream,
      },
      fields: 'id, webViewLink',
    });

    // Make the file publicly accessible so admins can view it easily from dashboard
    if (driveResponse.data.id) {
      await drive.permissions.create({
        fileId: driveResponse.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      fileId: driveResponse.data.id,
      webViewLink: driveResponse.data.webViewLink 
    });

  } catch (error: any) {
    console.error('Drive Upload Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
