// Generated. Specialist headshots and session photos: PREVIEW ONLY stand-ins from Openverse
// (Flickr / Wikimedia, Creative Commons). They are not the real specialists; replace with
// photos each specialist supplies (with consent) before release.
import type { ServiceKind } from '@/data/models';

const HEAD: Record<string, number> = {
  sp_maya: require('../../assets/people/sp_maya.jpg'),
  sp_karim_n: require('../../assets/people/sp_karim_n.jpg'),
  sp_rola: require('../../assets/people/sp_rola.jpg'),
  sp_joelle: require('../../assets/people/sp_joelle.jpg'),
  sp_hassan: require('../../assets/people/sp_hassan.jpg'),
  sp_nour: require('../../assets/people/sp_nour.jpg'),
  sp_fadi: require('../../assets/people/sp_fadi.jpg'),
  sp_elie: require('../../assets/people/sp_elie.jpg'),
  sp_samar: require('../../assets/people/sp_samar.jpg'),
  sp_tony: require('../../assets/people/sp_tony.jpg'),
  sp_bilal: require('../../assets/people/sp_bilal.jpg'),
  sp_ride: require('../../assets/people/sp_ride.jpg'),
};

const SESSION: Record<number, number> = {
  3: require('../../assets/people/session-3.jpg'),
  12: require('../../assets/people/session-12.jpg'),
  30: require('../../assets/people/session-30.jpg'),
  34: require('../../assets/people/session-34.jpg'),
  38: require('../../assets/people/session-38.jpg'),
  39: require('../../assets/people/session-39.jpg'),
  40: require('../../assets/people/session-40.jpg'),
  41: require('../../assets/people/session-41.jpg'),
  44: require('../../assets/people/session-44.jpg'),
  49: require('../../assets/people/session-49.jpg'),
  59: require('../../assets/people/session-59.jpg'),
  60: require('../../assets/people/session-60.jpg'),
  61: require('../../assets/people/session-61.jpg'),
  73: require('../../assets/people/session-73.jpg'),
  75: require('../../assets/people/session-75.jpg'),
};

const BY_KIND: Record<ServiceKind, number[]> = {"physio": [3, 75, 40, 38], "nursing": [41, 39, 73, 40], "ot": [30, 34, 39, 38], "prosthetics": [12, 59, 49], "repair": [60, 61, 44], "transport": [44, 61, 38]};

/** A headshot for this specialist, if we have one. */
export const specialistPhoto = (id: string): number | undefined => HEAD[id];

/** Session photos for the profile carousel, rotated so neighbours differ. */
export function sessionPhotos(kind: ServiceKind, seed: number): number[] {
  const list = BY_KIND[kind] ?? [];
  return list.map((_, k) => SESSION[list[(k + seed) % list.length]]);
}

export const PEOPLE_CREDITS: { file: string; title: string; creator: string | null; license: string; source: string | null }[] = [
  {
    "file": "people/sp_maya.jpg",
    "title": "Nurse",
    "creator": "Walt Stoneburner",
    "license": "CC BY 2.0",
    "source": "https://www.flickr.com/photos/8404611@N06/3373106750"
  },
  {
    "file": "people/sp_karim_n.jpg",
    "title": "adult, africa, african, black, care, cheerful, clinic, doctor,",
    "creator": "www.ilmicrofono.it",
    "license": "CC BY 2.0",
    "source": "https://www.flickr.com/photos/115089924@N02/16068674648"
  },
  {
    "file": "people/sp_rola.jpg",
    "title": "Nurse from overhead",
    "creator": "Walt Stoneburner",
    "license": "CC BY 2.0",
    "source": "https://www.flickr.com/photos/8404611@N06/3372541161"
  },
  {
    "file": "people/sp_joelle.jpg",
    "title": "Nurse hospital in Sri Lanka",
    "creator": "World Bank Photo Collection",
    "license": "CC BY-NC-ND 2.0",
    "source": "https://www.flickr.com/photos/10816734@N03/3487490818"
  },
  {
    "file": "people/sp_hassan.jpg",
    "title": "CB106274",
    "creator": "Spirit-Fire",
    "license": "CC BY 2.0",
    "source": "https://www.flickr.com/photos/50573017@N02/4964476405"
  },
  {
    "file": "people/sp_nour.jpg",
    "title": "Jinan",
    "creator": "Walt Stoneburner",
    "license": "CC BY 2.0",
    "source": "https://www.flickr.com/photos/8404611@N06/3413603682"
  },
  {
    "file": "people/sp_fadi.jpg",
    "title": "Andrew Maxim",
    "creator": "University of Salford",
    "license": "CC BY 2.0",
    "source": "https://www.flickr.com/photos/32104790@N02/3986205751"
  },
  {
    "file": "people/sp_elie.jpg",
    "title": "Seth Lemmons Photography :: Headshot",
    "creator": "Seth Lemmons",
    "license": "CC BY 2.0",
    "source": "https://www.flickr.com/photos/36061848@N05/7464854342"
  },
  {
    "file": "people/sp_samar.jpg",
    "title": "Health care worker in Nepal",
    "creator": "World Bank Photo Collection",
    "license": "CC BY-NC-ND 2.0",
    "source": "https://www.flickr.com/photos/10816734@N03/9345883024"
  },
  {
    "file": "people/sp_tony.jpg",
    "title": "Dai 'F**k'",
    "creator": "evans.photo",
    "license": "CC BY-NC-ND 2.0",
    "source": "https://www.flickr.com/photos/8251760@N02/25100813047"
  },
  {
    "file": "people/sp_bilal.jpg",
    "title": "Will",
    "creator": "mckenziemedia",
    "license": "CC BY-NC 2.0",
    "source": "https://www.flickr.com/photos/24562578@N05/49563653341"
  },
  {
    "file": "people/sp_ride.jpg",
    "title": "Peter Skelton - one of the British medics helping an earthquake-hit hospital in Kathmandu, Nepal",
    "creator": "DFID - UK Department for International Development",
    "license": "CC BY 2.0",
    "source": "https://www.flickr.com/photos/14214150@N02/16723141213"
  },
  {
    "file": "people/session-3.jpg",
    "title": "Learning to walk again in Democratic Republic Congo (DRC)",
    "creator": "EU Civil Protection and Humanitarian Aid",
    "license": "CC BY-NC-ND 2.0",
    "source": "https://www.flickr.com/photos/69583224@N05/40895020681"
  },
  {
    "file": "people/session-12.jpg",
    "title": "Terri Medina showing leg",
    "creator": "helloitspd",
    "license": "CC BY 2.0",
    "source": "https://www.flickr.com/photos/70954080@N00/6777419151"
  },
  {
    "file": "people/session-30.jpg",
    "title": "Dad at Occupational Therapy - Rehabilitation Institute of Chicago-Willowbrook",
    "creator": "ex_magician",
    "license": "CC BY-NC 2.0",
    "source": "https://www.flickr.com/photos/37882873@N00/8573646754"
  },
  {
    "file": "people/session-34.jpg",
    "title": "Dad at Occupational Therapy - Rehabilitation Institute of Chicago-Willowbrook",
    "creator": "ex_magician",
    "license": "CC BY-NC 2.0",
    "source": "https://www.flickr.com/photos/37882873@N00/8572553417"
  },
  {
    "file": "people/session-38.jpg",
    "title": "Visiting Senior Patients",
    "creator": "agilemktg1",
    "license": "PDM",
    "source": "https://www.flickr.com/photos/68716695@N06/29609189022"
  },
  {
    "file": "people/session-39.jpg",
    "title": "caring adult daughter accompanying senior mother visiting doctor",
    "creator": "agilemktg1",
    "license": "PDM",
    "source": "https://www.flickr.com/photos/68716695@N06/29720272855"
  },
  {
    "file": "people/session-40.jpg",
    "title": "happy senior patient with friendly female nurse",
    "creator": "agilemktg1",
    "license": "PDM",
    "source": "https://www.flickr.com/photos/68716695@N06/29609199652"
  },
  {
    "file": "people/session-41.jpg",
    "title": "A home visit to an elderly patient on bed rest, Kesennuma, Miyagi",
    "creator": "Direct_Relief",
    "license": "CC BY-NC-ND 2.0",
    "source": "https://www.flickr.com/photos/43649101@N07/6722780489"
  },
  {
    "file": "people/session-44.jpg",
    "title": "Community relations project",
    "creator": "UNC - CFC - USFK",
    "license": "CC BY 2.0",
    "source": "https://www.flickr.com/photos/35352823@N06/3366040101"
  },
  {
    "file": "people/session-49.jpg",
    "title": "Standing on her own two feet again",
    "creator": "DFID - UK Department for International Development",
    "license": "CC BY-NC-ND 2.0",
    "source": "https://www.flickr.com/photos/14214150@N02/4773455997"
  },
  {
    "file": "people/session-59.jpg",
    "title": "Prosthetic Clinic in Port-au-Prince, Haiti",
    "creator": "United Nations Photo",
    "license": "CC BY-NC-ND 2.0",
    "source": "https://www.flickr.com/photos/35483578@N03/4555338689"
  },
  {
    "file": "people/session-60.jpg",
    "title": "Late night wheelchair repair",
    "creator": "Elyse Horvath",
    "license": "CC BY-SA 2.0",
    "source": "https://www.flickr.com/photos/101034470@N04/10374122966"
  },
  {
    "file": "people/session-61.jpg",
    "title": "The Association for Persons with Disabilities in Bloemfontein",
    "creator": "World Bank Photo Collection",
    "license": "CC BY-NC-ND 2.0",
    "source": "https://www.flickr.com/photos/10816734@N03/1128195263"
  },
  {
    "file": "people/session-73.jpg",
    "title": "140320-F-AD344-242",
    "creator": "DMA Hawaii Forward Center",
    "license": "CC BY-NC-ND 2.0",
    "source": "https://www.flickr.com/photos/44173256@N06/13317168603"
  },
  {
    "file": "people/session-75.jpg",
    "title": "150819-M-DN141-056",
    "creator": "U.S. Pacific Fleet",
    "license": "CC BY-NC 2.0",
    "source": "https://www.flickr.com/photos/43397645@N06/20612222519"
  }
];
