import z from 'zod';

export const schemaRegister = z.object({
    name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
    avatarUrl: z.string().url().optional(),
    joinDate: z.date().optional(),
});

export const schemaLogin = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export const schemaCreateCollection = z.object({
    name: z.string().min(3),
    email_user: z.string().email().optional(),
    filterType: z.enum(['tribal', 'set', 'artist', 'type', 'advanced', 'list']),
    filterValue: z.string().min(1),
    query: z.string().min(1),
    ownedCardIds: z.array(z.string()).optional(),
    quantities: z.record(z.string(), z.number()).optional(),
    coverImage: z.string().optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
    buyListIds: z.array(z.string()).optional(),
    printListIds: z.array(z.string()).optional(),
});

export const schemaUpdateCollection = z.object({
    collectionId: z.string(),  // ID da coleção a atualizar
    ownedCardIds: z.array(z.string()).optional(),
    quantities: z.record(z.string(), z.number()).optional(),
    coverImage: z.string().optional(),
    name: z.string().min(3).optional(),
});

export const schemaCardOperation = z.discriminatedUnion('action', [
    z.object({
        action: z.literal('add'),
        collectionId: z.string(),
        cardId: z.string(),
        quantity: z.number().default(1),
    }),
    z.object({
        action: z.literal('remove'),
        collectionId: z.string(),
        cardId: z.string(),
    }),
    z.object({
        action: z.literal('update'),
        collectionId: z.string(),
        cardId: z.string(),
        quantity: z.number().min(1),
    }),
    z.object({
        action: z.literal('addToBuy'),
        collectionId: z.string(),
        cardId: z.string(),
    }),
    z.object({
        action: z.literal('removeFromBuy'),
        collectionId: z.string(),
        cardId: z.string(),
    }),
    z.object({
        action: z.literal('addToPrint'),
        collectionId: z.string(),
        cardId: z.string(),
    }),
    z.object({
        action: z.literal('removeFromPrint'),
        collectionId: z.string(),
        cardId: z.string(),
    }),
]);

export const schemaDeleteCollection = z.object({
    collectionId: z.string(),
});

export const schemaSavedSearch = z.object({
    name: z.string().min(1),
    timestamp: z.number().optional(),
    email_user: z.string().email().optional(),
    criteria: z.object({
        searchTerm: z.string(),
        selectedSet: z.string().nullable(),
        advancedFilters: z.object({
            rarity: z.string(),
            color: z.string(),
            cmc: z.string(),
            power: z.string(),
            toughness: z.string(),
        }),
    }),
});
export const schemaDeleteSearch = z.object({
    searchId: z.string(),
});

export const schemaRenameCollection = z.object({
    collectionId: z.string(),
    newName: z.string().min(1)
});