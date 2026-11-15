export const serializeUser = (user) => {
    if (!user) {
        return null;
    }
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        isVerified: Boolean(user.isVerified),
        createdAt: user.createdAt
    };
};

export const serializeAdmin = (admin) => {
    if (!admin) {
        return null;
    }
    return {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        createdAt: admin.createdAt
    };
};

export const cleanDocument = (document) => {
    if (!document) {
        return document;
    }

    const clean = { ...document };
    delete clean._id;
    delete clean.__v;
    delete clean.passwordHash;
    delete clean.verificationTokenHash;
    delete clean.verificationTokenExpires;
    return clean;
};

export const cleanDocuments = (documents) => documents.map((document) => cleanDocument(document));
