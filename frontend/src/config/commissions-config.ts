"use server";

import { query } from "@/lib/database";

export interface PricesConfig {
    id: number;
    image: string;
    type: string;
    price: string;
    description: string;
    order: number;
}

export async function getPrices(): Promise<Array<PricesConfig>> {
    const q = await query("SELECT * FROM prices ORDER BY `order` ASC");
    return q;
}

export async function insertPrice(data: PricesConfig): Promise<void> {
    const { image, type, price, description, order } = data;
    await query("INSERT INTO prices (image, type, price, description, `order`) VALUES (?, ?, ?, ?, ?)", [image, type, price, description, order]);
}

export async function deletePrice(id: number): Promise<void> {
    await query("DELETE FROM prices WHERE id = ?", [id]);
}

export async function updatePrice(id: number, data: Partial<PricesConfig>): Promise<void> {
    const fields = Object.keys(data)
        .map((key) => `\`${key}\` = ?`)
        .join(", ");
    const values = Object.values(data);
    await query(`UPDATE prices SET ${fields} WHERE id = ?`, [...values, id]);
}

export interface ArtGallery {
    id: number;
    image: string;
    type: string;
    client: string;
    order: number;
}

export async function getGallery(): Promise<Array<ArtGallery>> {
    const q = await query("SELECT * FROM gallery ORDER BY `order` ASC");
    return q;
}

export async function insertGalleryItem(data: ArtGallery): Promise<void> {
    const { image, type, client, order } = data;
    await query("INSERT INTO gallery (image, type, client, `order`) VALUES (?, ?, ?, ?)", [image, type, client, order]);
}

export async function deleteGalleryItem(id: number): Promise<void> {
    await query("DELETE FROM gallery WHERE id = ?", [id]);
}

export async function updateGalleryItem(id: number, data: Partial<ArtGallery>): Promise<void> {
    const fields = Object.keys(data)
        .map((key) => `\`${key}\` = ?`)
        .join(", ");
    const values = Object.values(data);
    await query(`UPDATE gallery SET ${fields} WHERE id = ?`, [...values, id]);
}

export interface TosItem {
    id: number;
    title: string;
    content: string;
    order: number;
}

export async function getTos(): Promise<Array<TosItem>> {
    const q = await query("SELECT * FROM tos ORDER BY `order` ASC");
    return q;
}

export async function insertTosItem(data: TosItem): Promise<void> {
    const { title, content, order } = data;
    await query("INSERT INTO tos (title, content, `order`) VALUES (?, ?, ?)", [title, content, order]);
}

export async function deleteTosItem(id: number): Promise<void> {
    await query("DELETE FROM tos WHERE id = ?", [id]);
}

export async function updateTosItem(id: number, data: Partial<TosItem>): Promise<void> {
    const fields = Object.keys(data)
        .map((key) => `\`${key}\` = ?`)
        .join(", ");
    const values = Object.values(data);
    await query(`UPDATE tos SET ${fields} WHERE id = ?`, [...values, id]);
}

export interface BannerItem {
    id: number;
    image: string;
}

export async function getBanner(): Promise<BannerItem | undefined> {
    const q = await query("SELECT * FROM banner ORDER BY id DESC LIMIT 1;");
    return q[0];
}

export async function insertBanner(data: BannerItem): Promise<void> {
    const { image } = data;
    await query("INSERT INTO banner (image) VALUES (?)", [image]);
}

export async function deleteBanner(id: number): Promise<void> {
    await query("DELETE FROM banner WHERE id = ?", [id]);
}

export async function updateBanner(id: number, data: Partial<BannerItem>): Promise<void> {
    const fields = Object.keys(data)
        .map((key) => `\`${key}\` = ?`)
        .join(", ");
    const values = Object.values(data);
    await query(`UPDATE banner SET ${fields} WHERE id = ?`, [...values, id]);
}
