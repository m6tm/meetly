"use client";

const SECRET_BKEY = process.env.NEXT_PUBLIC_CRYPT_BKEY;

export const serializeData = <T>(data: T) => {
    if (!SECRET_BKEY) {
        throw new Error("CRYPT_BKEY is not defined");
    }
    const serializedData = JSON.stringify(data);
    const encodedData = btoa(serializedData + SECRET_BKEY);
    return encodedData;
}

export const deserializeData = <T>(data: string) => {
    if (!SECRET_BKEY) {
        throw new Error("CRYPT_BKEY is not defined");
    }
    const decodedData = atob(data);
    const cleanedData = decodedData.replace(SECRET_BKEY, '');
    const parsedData = JSON.parse(cleanedData);
    return parsedData as T;
}

export const encrypt = (data: string): string => {
    if (!SECRET_BKEY) {
        throw new Error("CRYPT_BKEY is not defined");
    }
    const encodedData = btoa(data + SECRET_BKEY);
    return encodedData;
}

export const decrypt = (data: string): string => {
    if (!SECRET_BKEY) {
        throw new Error("CRYPT_BKEY is not defined");
    }
    const decodedData = atob(data);
    const cleanedData = decodedData.replace(SECRET_BKEY, '');
    return cleanedData;
}