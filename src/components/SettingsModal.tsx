import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { X, Moon, Sun, Globe, Bell, Palette, Download, Trash2, Shield, HelpCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';
import { SettingsService, UserSettings } from '../services/SettingsService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { theme, language, setTheme, setLanguage } = useTheme();
  const { t } = useTranslation();
  const [settings, setSettings] = useState<UserSettings>({
    language: 'vi',
    theme: 'light',
    notifications: true,
    autoSave: true,
    gridLines: true,
    soundEffects: false,
    highContrast: false
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [saveTimer, setSaveTimer] = useState<number | null>(null);

  // Load current settings from Firestore
  useEffect(() => {
    const loadSettings = async () => {
      if (currentUser) {
        try {
          setInitialLoading(true);
          const savedSettings = await SettingsService.getSettings(currentUser.uid);
          if (savedSettings) {
            setSettings(savedSettings);
          }
        } catch (error) {
          console.error('Error loading settings:', error);
          // Use current theme and language from context as fallback
          setSettings(prev => ({
            ...prev,
            theme,
            language
          }));
        } finally {
          setInitialLoading(false);
        }
      }
    };

    if (isOpen) {
      loadSettings();
    }
  }, [currentUser, isOpen, theme, language]);

  const applyAndSave = async (next: UserSettings) => {
    try {
      setLoading(true);
      // Apply immediately in app
      if (next.theme !== theme) {
        await setTheme(next.theme);
      }
      if (next.language !== language) {
        await setLanguage(next.language);
      }
      // Persist to Firestore if logged in
      if (currentUser) {
        await SettingsService.saveSettings(currentUser.uid, next);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value } as UserSettings;
      // Debounce rapid toggles to reduce writes
      if (saveTimer) {
        window.clearTimeout(saveTimer);
      }
      const timer = window.setTimeout(() => {
        applyAndSave(next);
      }, 200);
      setSaveTimer(timer);
      return next;
    });
  };

  const handleExportData = () => {
    // TODO: Implement data export
    alert('Tính năng xuất dữ liệu sẽ được triển khai sớm!');
  };

  const handleDeleteAccount = () => {
    if (confirm('Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác!')) {
      // TODO: Implement account deletion
      alert('Tính năng xóa tài khoản sẽ được triển khai sớm!');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6 max-h-[70vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold dark:text-white">{t('settings.title')}</h3>
              <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
                <X size={18} />
              </Button>
            </div>

            {initialLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {t('common.loading')}
                </div>
              </div>
            ) : (
            <>
            <div className="space-y-6 overflow-y-auto pr-2" style={{ maxHeight: 'calc(70vh - 64px)' }}>
              {/* Language Settings */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Globe className="text-blue-500" size={18} />
                  <Label className="text-sm font-medium dark:text-white">{t('settings.language')}</Label>
                </div>
                <Select value={settings.language} onValueChange={(value) => handleSettingChange('language', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vi">🇻🇳 Tiếng Việt</SelectItem>
                    <SelectItem value="en">🇺🇸 English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Theme Settings */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Palette className="text-purple-500" size={18} />
                  <Label className="text-sm font-medium dark:text-white">{t('settings.theme')}</Label>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {settings.theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                    <span className="text-sm dark:text-gray-300">
                      {settings.theme === 'dark' ? t('settings.darkMode') : t('settings.lightMode')}
                    </span>
                  </div>
                  <Switch
                    checked={settings.theme === 'dark'}
                    onCheckedChange={(checked) => handleSettingChange('theme', checked ? 'dark' : 'light')}
                  />
                </div>
              </div>

              <Separator />

              {/* Notification Settings */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Bell className="text-green-500" size={18} />
                  <Label className="text-sm font-medium dark:text-white">{t('settings.notifications')}</Label>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm dark:text-gray-300">{t('settings.pushNotifications')}</span>
                    <Switch
                      checked={settings.notifications}
                      onCheckedChange={(checked) => handleSettingChange('notifications', checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Drawing Settings */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Palette className="text-orange-500" size={18} />
                  <Label className="text-sm font-medium dark:text-white">{t('settings.drawing')}</Label>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm dark:text-gray-300">{t('settings.autoSave')}</span>
                    <Switch
                      checked={settings.autoSave}
                      onCheckedChange={(checked) => handleSettingChange('autoSave', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm dark:text-gray-300">{t('settings.gridLines')}</span>
                    <Switch
                      checked={settings.gridLines}
                      onCheckedChange={(checked) => handleSettingChange('gridLines', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm dark:text-gray-300">{t('settings.soundEffects')}</span>
                    <Switch
                      checked={settings.soundEffects}
                      onCheckedChange={(checked) => handleSettingChange('soundEffects', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm dark:text-gray-300">{t('settings.highContrast')}</span>
                    <Switch
                      checked={settings.highContrast}
                      onCheckedChange={(checked) => handleSettingChange('highContrast', checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Data Management */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Download className="text-indigo-500" size={18} />
                  <Label className="text-sm font-medium dark:text-white">{t('settings.dataManagement')}</Label>
                </div>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportData}
                    className="w-full justify-start"
                  >
                    <Download size={16} className="mr-2" />
                    {t('settings.exportData')}
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Account Settings */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="text-red-500" size={18} />
                  <Label className="text-sm font-medium dark:text-white">{t('settings.account')}</Label>
                </div>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteAccount}
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 size={16} className="mr-2" />
                    {t('settings.deleteAccount')}
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Help */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <HelpCircle className="text-gray-500" size={18} />
                  <Label className="text-sm font-medium dark:text-white">{t('settings.help')}</Label>
                </div>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('https://github.com/kqhuy04/Pixel-App-Drawing/issues', '_blank')}
                    className="w-full justify-start"
                  >
                    <HelpCircle size={16} className="mr-2" />
                    {t('settings.reportIssue')}
                  </Button>
                </div>
              </div>
            </div>

            {/* Footer intentionally removed to auto-save on change */}
            </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};



