import { db } from '@/db/db'
import { account, question_bank, tests, testSettings } from '@/db/schema'
import * as jwt from 'jose'
import * as crypto from 'crypto'
import { eq } from 'drizzle-orm'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method == 'PUT') {
        try {
            // Get data
            const data = JSON.parse(req.body)
            let cookie = await req.cookies['token']
            // @ts-ignore
            let info = await await (await jwt.jwtVerify(cookie, crypto.createSecretKey(process.env.JWT_SECRET, 'utf-8')));
            // @ts-ignore
            let accountInfo = await db.select().from(account).where(eq(account.email, info.payload.email))
            if (accountInfo[0].role == 'owner' || accountInfo[0].role == 'admin') {
                // await db.update(tests).set({
                //     'description': data.description,
                //     'name': data.name,
                //     'starts_on': data.start_time,
                //     'ends_on': data.end_time,
                // }).where(eq(tests.id, data.id))
                let test_settings = await db.select().from(testSettings).where(eq(testSettings.test_id,data.test_id))
                if (test_settings.length == 0) {
                    await db.insert(testSettings).values({
                        'test_id': data.test_id
                    })
                }
                res.status(201).json({
                    coreStatus: 'UPDATED_TEST',
                    message: 'Updated test information successfully'
                })
            } else {
                res.status(403).json({
                    coreStatus: 'NOT_ALLOWED_ROLE',
                    message: 'You are not allowed to update a test.'
                })
            }
        } catch (e) {
            res.status(400).json({
                coreStatus: 'ERROR',
                message: 'An error has occurred.'
            })
        }
    }
}