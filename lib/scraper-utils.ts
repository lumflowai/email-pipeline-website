// Mock data generator for lead scraping simulation

export const businessNames = [
    "Joe's Pizza", "Golden Dragon", "Burger Palace", "Sushi Master", "Taco Town",
    "The Italian Kitchen", "Brooklyn Bagels", "Manhattan Deli", "Empire Steakhouse",
    "Central Park Cafe", "Hudson River Grill", "Broadway Bistro", "Fifth Avenue Diner",
    "SoHo Sushi", "Chelsea Grill", "Midtown Eats", "Upper East Cafe", "West Village Wine",
    "Harlem Soul Food", "Tribeca Tavern", "Wall Street Steaks", "Queens Kitchen",
    "Bronx BBQ", "Brooklyn Brewery", "Staten Island Seafood", "Times Square Tacos",
    "Grand Central Grill", "Penn Station Pizza", "Rockefeller Ramen", "Carnegie Deli",
    "Lexington Lounge", "Park Avenue Pub", "Madison Square Munch", "Union Square Sushi",
    "Gramercy Grill", "Murray Hill Meatballs", "Kips Bay Kitchen", "NoHo Noodles",
    "Little Italy Lasagna", "Chinatown Chopsticks", "Korea Town Kitchen", "Curry Hill Cuisine",
    "Hell's Kitchen Heat", "Clinton Cafe", "Theater District Treats", "Diamond District Deli",
];

export const streetNames = [
    "Broadway", "5th Avenue", "Park Avenue", "Madison Avenue", "Lexington Avenue",
    "3rd Avenue", "2nd Avenue", "1st Avenue", "Amsterdam Avenue", "Columbus Avenue",
    "Central Park West", "West End Avenue", "Riverside Drive", "Hudson Street",
    "Greenwich Street", "Church Street", "Canal Street", "Houston Street",
    "Bleecker Street", "Spring Street", "Prince Street", "Mulberry Street",
];

export const emailDomains = [
    "gmail.com", "outlook.com", "yahoo.com", "hotmail.com", "aol.com",
];

function generatePhone(): string {
    const area = Math.floor(Math.random() * 900) + 100;
    const prefix = Math.floor(Math.random() * 900) + 100;
    const line = Math.floor(Math.random() * 9000) + 1000;
    return `+1 (${area}) ${prefix}-${line}`;
}

function generateEmail(businessName: string): string | null {
    // 70% chance of having an email
    if (Math.random() > 0.7) return null;

    const sanitized = businessName.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 15);
    const domain = emailDomains[Math.floor(Math.random() * emailDomains.length)];
    const prefixes = ["info", "contact", "hello", "support", "order"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];

    return `${prefix}@${sanitized}.com`;
}

function generateAddress(location: string): string {
    const number = Math.floor(Math.random() * 9000) + 100;
    const street = streetNames[Math.floor(Math.random() * streetNames.length)];
    const zip = Math.floor(Math.random() * 90000) + 10000;

    const city = location.split(",")[0] || "New York";
    const state = location.split(",")[1]?.trim() || "NY";

    return `${number} ${street}, ${city}, ${state} ${zip}`;
}

function generateRating(): number {
    // Weighted towards higher ratings (3.5 - 5.0)
    return Math.round((3.5 + Math.random() * 1.5) * 10) / 10;
}

function generateReviews(): number {
    // Random between 5 and 2000
    return Math.floor(Math.random() * 1995) + 5;
}

export interface Lead {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    rating: number;
    reviews: number;
    address: string;
    website: string | null;
}

export function generateLead(index: number, location: string, keyword: string): Lead {
    const baseName = businessNames[index % businessNames.length];
    const suffix = index >= businessNames.length ? ` #${Math.floor(index / businessNames.length) + 1}` : "";
    const name = baseName + suffix;

    const email = generateEmail(name);
    const website = email ? `https://${email.split("@")[1]}` : null;

    return {
        id: `lead_${Date.now()}_${index}`,
        name,
        phone: generatePhone(),
        email,
        rating: generateRating(),
        reviews: generateReviews(),
        address: generateAddress(location),
        website,
    };
}

export function generateLeads(count: number, location: string, keyword: string): Lead[] {
    return Array.from({ length: count }, (_, i) => generateLead(i, location, keyword));
}

export interface Scrape {
    id: string;
    location: string;
    keyword: string;
    maxResults: number;
    listName?: string;
    status: "pending" | "running" | "completed" | "failed";
    progress: number;
    leadsFound: number;
    leadsWithEmail: number;
    leadsWithPhone: number;
    avgRating: number;
    results: Lead[];
    createdAt: string;
    completedAt: string | null;
    error: string | null;
}

export interface LeadList {
    id: string;
    name: string;
    scrapeIds: string[];
    totalLeads: number;
    createdAt: string;
    updatedAt: string;
}

export function createScrape(location: string, keyword: string, maxResults: number, listName?: string): Scrape {
    return {
        id: `scrape_${Date.now()}`,
        location,
        keyword,
        maxResults,
        listName,
        status: "pending",
        progress: 0,
        leadsFound: 0,
        leadsWithEmail: 0,
        leadsWithPhone: 0,
        avgRating: 0,
        results: [],
        createdAt: new Date().toISOString(),
        completedAt: null,
        error: null,
    };
}

// LocalStorage helpers
const SCRAPES_KEY = "lumflow_scrapes";
const LEAD_LISTS_KEY = "lumflow_lead_lists";

export function getSavedScrapes(): Scrape[] {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem(SCRAPES_KEY);
    return saved ? JSON.parse(saved) : [];
}

export function saveScrape(scrape: Scrape): void {
    if (typeof window === "undefined") return;
    const scrapes = getSavedScrapes();
    const existingIndex = scrapes.findIndex((s) => s.id === scrape.id);

    if (existingIndex >= 0) {
        scrapes[existingIndex] = scrape;
    } else {
        scrapes.unshift(scrape);
    }

    // Keep only last 20 scrapes
    const trimmed = scrapes.slice(0, 20);
    localStorage.setItem(SCRAPES_KEY, JSON.stringify(trimmed));
}

export function deleteScrape(id: string): void {
    if (typeof window === "undefined") return;
    const scrapes = getSavedScrapes().filter((s) => s.id !== id);
    localStorage.setItem(SCRAPES_KEY, JSON.stringify(scrapes));
}

// Lead List Management
export function getSavedLeadLists(): LeadList[] {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem(LEAD_LISTS_KEY);
    return saved ? JSON.parse(saved) : [];
}

export function getLeadListByName(name: string): LeadList | null {
    const lists = getSavedLeadLists();
    return lists.find((list) => list.name === name) || null;
}

export function saveLeadList(listName: string, scrapeId: string): void {
    if (typeof window === "undefined") return;
    const lists = getSavedLeadLists();
    const existingList = lists.find((list) => list.name === listName);

    if (existingList) {
        // Update existing list
        existingList.scrapeIds.push(scrapeId);
        existingList.updatedAt = new Date().toISOString();

        // Calculate total leads from all scrapes
        const scrapes = getSavedScrapes();
        const listScrapes = scrapes.filter((s) => existingList.scrapeIds.includes(s.id));
        existingList.totalLeads = listScrapes.reduce((sum, s) => sum + s.leadsFound, 0);
    } else {
        // Create new list
        const newList: LeadList = {
            id: `list_${Date.now()}`,
            name: listName,
            scrapeIds: [scrapeId],
            totalLeads: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        lists.push(newList);
    }

    localStorage.setItem(LEAD_LISTS_KEY, JSON.stringify(lists));
}

export function updateLeadListTotalLeads(listName: string): void {
    if (typeof window === "undefined") return;
    const lists = getSavedLeadLists();
    const list = lists.find((l) => l.name === listName);

    if (list) {
        const scrapes = getSavedScrapes();
        const listScrapes = scrapes.filter((s) => list.scrapeIds.includes(s.id));
        list.totalLeads = listScrapes.reduce((sum, s) => sum + s.leadsFound, 0);
        localStorage.setItem(LEAD_LISTS_KEY, JSON.stringify(lists));
    }
}

export function deleteLeadList(listName: string): void {
    if (typeof window === "undefined") return;
    const lists = getSavedLeadLists().filter((list) => list.name !== listName);
    localStorage.setItem(LEAD_LISTS_KEY, JSON.stringify(lists));
}

export function getLeadsByListName(listName: string): Lead[] {
    const list = getLeadListByName(listName);
    if (!list) return [];

    const scrapes = getSavedScrapes();
    const listScrapes = scrapes.filter((s) => list.scrapeIds.includes(s.id));

    // Combine all leads from all scrapes in this list
    return listScrapes.flatMap((scrape) => scrape.results);
}

// CSV Export
export function exportToCSV(leads: Lead[], filename: string): void {
    const headers = ["Business Name", "Phone", "Email", "Rating", "Reviews", "Address", "Website"];
    const rows = leads.map((lead) => [
        `"${lead.name.replace(/"/g, '""')}"`,
        lead.phone,
        lead.email || "",
        lead.rating.toString(),
        lead.reviews.toString(),
        `"${lead.address.replace(/"/g, '""')}"`,
        lead.website || "",
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
