import { getCollection } from 'astro:content';

export async function projects() {
  return (await getCollection('projects', ({ data }) => !data.draft)).sort((a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title));
}
export async function contributions() {
  return (await getCollection('contributions', ({ data }) => !data.draft)).sort((a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title));
}
export async function notes() {
  return (await getCollection('notes', ({ data }) => !data.draft)).sort((a, b) => b.data.date.localeCompare(a.data.date));
}
export async function experience() {
  return (await getCollection('experience', ({ data }) => !data.draft)).sort((a, b) => a.data.order - b.data.order);
}
export async function milestones() {
  return (await getCollection('milestones', ({ data }) => !data.draft)).sort((a, b) => a.data.order - b.data.order);
}
