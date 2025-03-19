const User = require('../models/User');
const Invitation = require('../models/Invitation');
const jwtHelper = require('../utils/jwtHelper');
const emailService = require('./emailService');
const crypto = require('crypto');

/**
 * 認証サービス
 * ユーザー認証、登録、招待コード管理などの認証関連ビジネスロジックを担当
 * 
 * 変更履歴:
 * - 2025/03/19: 初期実装 (Geniemon)
 */

// ユーザー認証
exports.authenticateUser = async (email, password, rememberMe = false) => {
  try {
    // ユーザー検索
    const user = await User.findOne({ email });
    if (!user) {
      return { success: false, message: '認証情報が無効です' };
    }
    
    // パスワード検証
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return { success: false, message: '認証情報が無効です' };
    }
    
    // 最終ログイン時間更新
    await user.updateLastLogin();
    
    // トークン生成
    const token = jwtHelper.generateAccessToken(user);
    
    // 常にリフレッシュトークンを生成する
    let refreshToken = jwtHelper.generateRefreshToken(user);
    
    return {
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        profilePicture: user.profilePicture
      }
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, message: 'サーバーエラーが発生しました' };
  }
};

// ユーザー登録
exports.registerUser = async (email, password, invitationCode) => {
  try {
    // メールアドレスの重複チェック
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { success: false, message: 'このメールアドレスは既に使用されています' };
    }
    
    // 招待コードの検証
    if (invitationCode) {
      const isValidInvitation = await this.verifyInvitationCode(invitationCode);
      if (!isValidInvitation) {
        return { success: false, message: '無効または期限切れの招待コードです' };
      }
    }
    
    // 新規ユーザー作成
    const newUser = new User({
      email,
      password,
      // 招待コードの役割情報があれば反映
      role: invitationCode ? (await Invitation.findOne({ code: invitationCode }))?.role || 'user' : 'user'
    });
    
    await newUser.save();
    
    // 招待コードを使用済みにマーク
    if (invitationCode) {
      await this.markInvitationAsUsed(invitationCode, newUser._id);
    }
    
    // トークン生成
    const token = jwtHelper.generateAccessToken(newUser);
    const refreshToken = jwtHelper.generateRefreshToken(newUser);
    
    return {
      success: true,
      token,
      refreshToken,
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      }
    };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: 'ユーザー登録に失敗しました' };
  }
};

// 招待コード検証
exports.verifyInvitationCode = async (code) => {
  try {
    const invitation = await Invitation.validateInvitation(code);
    return !!invitation;
  } catch (error) {
    console.error('Invitation verification error:', error);
    return false;
  }
};

// 招待コードを使用済みにマーク
exports.markInvitationAsUsed = async (code, userId) => {
  try {
    return await Invitation.markAsUsed(code, userId);
  } catch (error) {
    console.error('Marking invitation error:', error);
    return false;
  }
};

// 招待コード作成
exports.createInvitationCode = async (creatorId, options = {}) => {
  try {
    const {
      expiresInDays = 7,
      role = 'user',
      email = null,
      maxUses = 1
    } = options;
    
    // 招待コード生成
    const code = Invitation.generateInvitationCode();
    
    // 有効期限計算
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    
    // 招待コード保存
    const invitation = new Invitation({
      code,
      createdBy: creatorId,
      expiresAt,
      role,
      email,
      maxUses
    });
    
    await invitation.save();
    
    // 指定されたメールアドレスがある場合は招待メール送信
    if (email) {
      await emailService.sendInvitationEmail(email, code);
    }
    
    return {
      success: true,
      code,
      expiresAt
    };
  } catch (error) {
    console.error('Create invitation error:', error);
    return { success: false, message: '招待コードの作成に失敗しました' };
  }
};

// Googleログイン/登録
exports.handleGoogleAuth = async (googleProfile) => {
  try {
    const { email, id: googleId, name, picture: profilePicture } = googleProfile;
    
    // 既存ユーザー検索（GoogleIDまたはメールアドレスで）
    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    
    if (!user) {
      // 新規ユーザー作成（パスワードはランダム生成）
      const randomPassword = crypto.randomBytes(16).toString('hex');
      user = new User({
        email,
        password: randomPassword, // ランダムパスワード（使用されない）
        googleId,
        name: name || email.split('@')[0],
        profilePicture,
        role: 'user'
      });
      await user.save();
    } else {
      // 既存ユーザーのGoogle情報更新
      if (!user.googleId) user.googleId = googleId;
      if (!user.name && name) user.name = name;
      if (!user.profilePicture && profilePicture) user.profilePicture = profilePicture;
      await user.save();
    }
    
    // 最終ログイン時間更新
    await user.updateLastLogin();
    
    // トークン生成
    const token = jwtHelper.generateAccessToken(user);
    const refreshToken = jwtHelper.generateRefreshToken(user);
    
    return {
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        profilePicture: user.profilePicture
      }
    };
  } catch (error) {
    console.error('Google auth error:', error);
    return { success: false, message: 'Googleログイン処理中にエラーが発生しました' };
  }
};

// パスワードリセットトークン生成
exports.generatePasswordResetToken = async (email) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      // セキュリティのため、ユーザーが存在しない場合でも成功を返す
      return { success: true };
    }
    
    // ランダムトークン生成
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // トークンをハッシュ化して保存
    const resetTokenExpiry = Date.now() + 3600000; // 1時間有効
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpires = resetTokenExpiry;
    
    await user.save();
    
    // リセットメール送信
    await emailService.sendPasswordResetEmail(user.email, resetToken);
    
    return { success: true };
  } catch (error) {
    console.error('Password reset token error:', error);
    return { success: false, message: 'パスワードリセットトークンの生成に失敗しました' };
  }
};

// パスワードリセット
exports.resetPassword = async (token, newPassword) => {
  try {
    // トークンをハッシュ化
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    // 有効なトークンを持つユーザーを検索
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return { success: false, message: '無効または期限切れのトークンです' };
    }
    
    // パスワード更新
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    // パスワード変更通知メール送信
    await emailService.sendPasswordChangeNotification(user.email);
    
    return { success: true, message: 'パスワードが正常にリセットされました' };
  } catch (error) {
    console.error('Password reset error:', error);
    return { success: false, message: 'パスワードのリセットに失敗しました' };
  }
};

// リフレッシュトークンでの認証更新
exports.refreshAuthentication = async (refreshToken) => {
  try {
    // リフレッシュトークン検証
    const decoded = jwtHelper.verifyToken(refreshToken, true);
    if (!decoded) {
      return { success: false, message: '無効なリフレッシュトークンです' };
    }
    
    // ユーザー検索
    const user = await User.findById(decoded.id);
    if (!user) {
      return { success: false, message: 'ユーザーが見つかりません' };
    }
    
    // 新しいアクセストークン生成
    const newAccessToken = jwtHelper.generateAccessToken(user);
    
    return {
      success: true,
      token: newAccessToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        profilePicture: user.profilePicture
      }
    };
  } catch (error) {
    console.error('Refresh authentication error:', error);
    return { success: false, message: '認証の更新に失敗しました' };
  }
};