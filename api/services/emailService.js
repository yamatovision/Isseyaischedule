const nodemailer = require('nodemailer');

/**
 * メール送信サービス
 * 認証関連のメール送信を担当
 * 
 * 変更履歴:
 * - 2025/03/19: 初期実装 (Geniemon)
 */

// メール送信用のトランスポーター設定
const createTransporter = () => {
  // 本番環境では環境変数から設定を読み込む
  if (process.env.NODE_ENV === 'production') {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
  }
  
  // 開発環境ではマックトラップまたはテスト用SMTPサーバー使用
  return nodemailer.createTransport({
    host: process.env.DEV_SMTP_HOST || 'smtp.mailtrap.io',
    port: process.env.DEV_SMTP_PORT || 2525,
    auth: {
      user: process.env.DEV_SMTP_USER || 'your_mailtrap_user',
      pass: process.env.DEV_SMTP_PASSWORD || 'your_mailtrap_password'
    }
  });
};

// 基本メール送信関数
const sendEmail = async (to, subject, html) => {
  try {
    const transporter = createTransporter();
    
    const from = process.env.EMAIL_FROM || 'noreply@plannavi.com';
    const appName = process.env.APP_NAME || 'プランナビ';
    
    await transporter.sendMail({
      from: `${appName} <${from}>`,
      to,
      subject,
      html
    });
    
    console.log(`【メール送信】宛先: ${to}, 件名: ${subject}`);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

// パスワードリセットメール送信
exports.sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${token}`;
  
  const subject = 'パスワードリセットのご依頼';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1976d2;">パスワードリセット</h2>
      <p>プランナビのパスワードリセットのリクエストを受け付けました。</p>
      <p>以下のリンクをクリックして、新しいパスワードを設定してください：</p>
      <p><a href="${resetUrl}" style="background-color: #1976d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">パスワードをリセットする</a></p>
      <p>このリンクは1時間のみ有効です。</p>
      <p>リクエストした覚えがない場合は、このメールを無視してください。</p>
      <p>何かご不明な点がございましたら、サポートまでお問い合わせください。</p>
      <p>プランナビ チーム</p>
    </div>
  `;
  
  return await sendEmail(email, subject, html);
};

// パスワード変更通知メール送信
exports.sendPasswordChangeNotification = async (email) => {
  const subject = 'パスワードが変更されました';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1976d2;">パスワード変更のお知らせ</h2>
      <p>プランナビのパスワードが正常に変更されました。</p>
      <p>この変更に心当たりがない場合は、すぐにサポートまでご連絡ください。</p>
      <p>プランナビ チーム</p>
    </div>
  `;
  
  return await sendEmail(email, subject, html);
};

// 招待メール送信
exports.sendInvitationEmail = async (email, invitationCode) => {
  const inviteUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/register?code=${invitationCode}`;
  
  const subject = 'プランナビへのご招待';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1976d2;">プランナビへようこそ</h2>
      <p>プランナビへの招待が届きました。</p>
      <p>以下のリンクをクリックして、アカウントを作成してください：</p>
      <p><a href="${inviteUrl}" style="background-color: #1976d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">アカウントを作成する</a></p>
      <p>または、次の招待コードを使用してください：</p>
      <p style="font-family: monospace; font-size: 18px; background-color: #f5f5f5; padding: 10px; text-align: center;">${invitationCode}</p>
      <p>プランナビは経営陣・意思決定者向けの専門的なタイムスケジュール管理ツールです。</p>
      <p>お困りのことがございましたら、サポートまでお問い合わせください。</p>
      <p>プランナビ チーム</p>
    </div>
  `;
  
  return await sendEmail(email, subject, html);
};

// 新規ユーザー登録完了メール送信
exports.sendWelcomeEmail = async (email, name) => {
  const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`;
  
  const subject = 'プランナビへようこそ';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1976d2;">プランナビへようこそ${name ? `, ${name}様` : ''}</h2>
      <p>プランナビへのご登録ありがとうございます。</p>
      <p>以下のリンクからログインして、プロジェクト管理を始めることができます：</p>
      <p><a href="${loginUrl}" style="background-color: #1976d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">ログイン</a></p>
      <p>ご不明な点がございましたら、お気軽にサポートまでお問い合わせください。</p>
      <p>プランナビ チーム</p>
    </div>
  `;
  
  return await sendEmail(email, subject, html);
};