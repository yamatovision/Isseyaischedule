const nodemailer = require('nodemailer');

// メール送信テスト関数
async function testEmailSending() {
  // トランスポーターの作成
  // 環境変数からメール設定を読み込む
  // 実際の認証情報は.envファイルに保存し、gitignoreで除外すること
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_FROM || 'your.email@gmail.com',
      pass: process.env.EMAIL_API_KEY || 'your_app_password' // 本番環境では必ず環境変数から読み込む
    }
  });

  // メールオプションの設定
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'your.email@gmail.com',
    to: process.env.EMAIL_FROM || 'your.email@gmail.com', // 自分自身に送信（テスト用）
    subject: 'Schedle アプリ - メール送信テスト',
    text: 'メール送信機能のテストです。このメールが届いていれば、設定は正常に機能しています。',
    html: `
      <h2>Schedleアプリ - メール設定テスト</h2>
      <p>このメールは、アプリケーションのメール送信機能が正常に動作していることを確認するためのテストメールです。</p>
      <p>このメールが正常に届いていれば、メール設定は完了しています。</p>
      <hr>
      <p><i>このメールは自動送信されています。返信は不要です。</i></p>
    `
  };

  try {
    // メール送信
    const info = await transporter.sendMail(mailOptions);
    console.log('メール送信成功！');
    console.log('メッセージID:', info.messageId);
    return info;
  } catch (error) {
    console.error('メール送信エラー:', error);
    throw error;
  }
}

// テスト実行
testEmailSending()
  .then(() => console.log('テスト完了'))
  .catch(err => console.error('テスト失敗:', err));