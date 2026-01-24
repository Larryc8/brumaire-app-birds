import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface ConfigContextType {
    downloadUrl: string;
    uploadUrl: string;
    downloadDirectory: string;
    setDownloadUrl: (url: string) => void;
    setUploadUrl: (url: string) => void;
    setDownloadDirectory: (dir: string) => void;
    setUseExternalDirectory: (useExternal: boolean) => void;
    saveConfig: () => Promise<void>;
    isLoading: boolean;
    useExternalDirectory: boolean;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const useConfig = () => {
    const context = useContext(ConfigContext);
    if (!context) {
        throw new Error('useConfig must be used within a ConfigProvider');
    }
    return context;
};

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [downloadUrl, setDownloadUrl] = useState('');
    const [uploadUrl, setUploadUrl] = useState('');
    const [downloadDirectory, setDownloadDirectory] = useState('birds');
    const [useExternalDirectory, setUseExternalDirectory] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            const savedDownloadUrl = await AsyncStorage.getItem('downloadUrl');
            const savedUploadUrl = await AsyncStorage.getItem('uploadUrl');
            const savedDownloadDirectory = await AsyncStorage.getItem('downloadDirectory');
            const savedUseExternalDirectory = await AsyncStorage.getItem('useExternalDirectory');

            if (savedDownloadUrl) setDownloadUrl(savedDownloadUrl);
            if (savedUploadUrl) setUploadUrl(savedUploadUrl);
            if (savedDownloadDirectory) setDownloadDirectory(savedDownloadDirectory);
            if (savedUseExternalDirectory) setUseExternalDirectory(savedUseExternalDirectory === 'true');
        } catch (e) {
            console.error('Failed to load config', e);
        } finally {
            setIsLoading(false);
        }
    };

    const saveConfig = async () => {
        try {
            await AsyncStorage.setItem('downloadUrl', downloadUrl);
            await AsyncStorage.setItem('uploadUrl', uploadUrl);
            await AsyncStorage.setItem('downloadDirectory', downloadDirectory);
            await AsyncStorage.setItem('useExternalDirectory', String(useExternalDirectory));
        } catch (e) {
            console.error('Failed to save config', e);
        }
    };

    return (
        <ConfigContext.Provider
            value={{
                downloadUrl,
                uploadUrl,
                downloadDirectory,
                setDownloadUrl,
                setUploadUrl,
                setDownloadDirectory,
                setUseExternalDirectory,
                saveConfig,
                isLoading,
                useExternalDirectory,
            }}
        >
            {children}
        </ConfigContext.Provider>
    );
};
