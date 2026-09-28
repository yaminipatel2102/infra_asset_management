"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const riskEngine_1 = require("../src/utils/riskEngine");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
const sampleImages = {
    roadGood: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    roadPoor: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    bridgeGood: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&w=800&q=80',
    bridgePoor: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80',
    buildingGood: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    buildingPoor: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
    beforeRepair: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80',
    afterRepair: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&w=800&q=80',
};
const seedAssets = [
    // --- ROADS ---
    {
        assetCode: 'RD-AMD-001',
        name: 'Ahmedabad-Gandhinagar Highway Corridor (SH-41)',
        assetType: client_1.AssetType.ROAD,
        district: 'Ahmedabad',
        location: 'S.G. Highway Stretch Km 12 to 34',
        latitude: 23.0754,
        longitude: 72.5273,
        constructionDate: new Date('2015-04-15'),
        currentCondition: client_1.Condition.GOOD,
        criticality: client_1.Criticality.VERY_HIGH,
        responsibleDivision: 'Ahmedabad R&B Division 1',
        status: client_1.AssetStatus.ACTIVE,
        road: { roadLength: 22.5, roadCategory: 'State Highway', surfaceType: 'Asphalt Concrete' },
        inspections: [
            {
                inspectionDate: new Date('2026-02-10'),
                inspectorName: 'Er. Rajesh Patel (EE)',
                condition: client_1.Condition.GOOD,
                observations: 'Pavement in excellent condition. Minor surface wear near Vaishnodevi Circle.',
                recommendedAction: 'Routine cleaning and lane marking restoration.',
                photoUrl: sampleImages.roadGood
            }
        ]
    },
    {
        assetCode: 'RD-SRT-002',
        name: 'Surat Outer Ring Road Section 4',
        assetType: client_1.AssetType.ROAD,
        district: 'Surat',
        location: 'Hazira - Dumas Industrial Connector',
        latitude: 21.1702,
        longitude: 72.8311,
        constructionDate: new Date('2018-09-20'),
        currentCondition: client_1.Condition.MODERATE,
        criticality: client_1.Criticality.HIGH,
        responsibleDivision: 'Surat Circle R&B Division',
        status: client_1.AssetStatus.ACTIVE,
        road: { roadLength: 18.2, roadCategory: 'Major District Road', surfaceType: 'Bituminous Concrete' },
        inspections: [
            {
                inspectionDate: new Date('2026-04-05'),
                inspectorName: 'Er. Sunita Sharma (AE)',
                condition: client_1.Condition.MODERATE,
                observations: 'Minor rutting and surface cracks along heavy vehicle lane near Hazira Port junction.',
                recommendedAction: 'Plan micro-surfacing within 3 months.',
                photoUrl: sampleImages.roadGood
            }
        ],
        maintenances: [
            {
                issue: 'Surface distress & minor pothole formation near heavy axle gate',
                priority: client_1.MaintenancePriority.MEDIUM,
                action: 'Patching and bituminous seal coat laying',
                assignedTo: 'Surat Infra Corp',
                expectedCompletionDate: new Date('2026-10-15'),
                cost: 450000,
                status: client_1.MaintenanceStatus.IN_PROGRESS,
                beforePhotoUrl: sampleImages.roadPoor
            }
        ]
    },
    {
        assetCode: 'RD-VAD-003',
        name: 'Vadodara-Halol Industrial Corridor (SH-87)',
        assetType: client_1.AssetType.ROAD,
        district: 'Vadodara',
        location: 'Waghodia Crossroad to Jarod Toll',
        latitude: 22.3072,
        longitude: 73.1812,
        constructionDate: new Date('2010-06-12'),
        currentCondition: client_1.Condition.CRITICAL,
        criticality: client_1.Criticality.VERY_HIGH,
        responsibleDivision: 'Vadodara R&B Division 2',
        status: client_1.AssetStatus.UNDER_MAINTENANCE,
        road: { roadLength: 35.0, roadCategory: 'State Highway', surfaceType: 'Asphalt' },
        inspections: [
            {
                inspectionDate: new Date('2026-08-14'),
                inspectorName: 'Er. Alok Verma (SE)',
                condition: client_1.Condition.CRITICAL,
                observations: 'Severe sub-base settlement, deep rutting and edge breakage due to monsoon heavy runoff.',
                recommendedAction: 'Immediate full depth pavement reconstruction & sub-grade stabilization.',
                photoUrl: sampleImages.roadPoor
            }
        ],
        maintenances: [
            {
                issue: 'Sub-base failure and structural pavement cracking',
                priority: client_1.MaintenancePriority.CRITICAL,
                action: 'Full-depth reclamation and high-performance asphalt resurfacing',
                assignedTo: 'Gujarat State Highway Contractors Ltd.',
                expectedCompletionDate: new Date('2026-11-30'),
                cost: 2800000,
                status: client_1.MaintenanceStatus.IN_PROGRESS,
                beforePhotoUrl: sampleImages.beforeRepair
            }
        ]
    },
    {
        assetCode: 'RD-RJK-004',
        name: 'Rajkot-Morbi Ceramic Highway (SH-24)',
        assetType: client_1.AssetType.ROAD,
        district: 'Rajkot',
        location: 'Gauridad to Tankara Stretch',
        latitude: 22.3039,
        longitude: 70.8022,
        constructionDate: new Date('2016-11-05'),
        currentCondition: client_1.Condition.POOR,
        criticality: client_1.Criticality.HIGH,
        responsibleDivision: 'Rajkot R&B Circle',
        status: client_1.AssetStatus.ACTIVE,
        road: { roadLength: 28.4, roadCategory: 'State Highway', surfaceType: 'Bituminous' },
        inspections: [
            {
                inspectionDate: new Date('2026-07-20'),
                inspectorName: 'Er. Chirag Mehta (AE)',
                condition: client_1.Condition.POOR,
                observations: 'Widespread fatigue cracking and shoulder erosion near ceramic manufacturing units.',
                recommendedAction: 'Milling of damaged surface and 50mm BC overlay.',
                photoUrl: sampleImages.roadPoor
            }
        ],
        maintenances: [
            {
                issue: 'Fatigue cracking and edge drop-offs',
                priority: client_1.MaintenancePriority.HIGH,
                action: 'Shoulder re-grading and asphalt overlay',
                assignedTo: 'Saurashtra Infra Tech',
                expectedCompletionDate: new Date('2026-10-30'),
                cost: 1200000,
                status: client_1.MaintenanceStatus.ASSIGNED,
                beforePhotoUrl: sampleImages.roadPoor
            }
        ]
    },
    {
        assetCode: 'RD-GND-005',
        name: 'Gandhinagar Central Vista Boulevard (Sector 10-20)',
        assetType: client_1.AssetType.ROAD,
        district: 'Gandhinagar',
        location: 'CH-Road Arterial Network',
        latitude: 23.2156,
        longitude: 72.6369,
        constructionDate: new Date('2020-01-10'),
        currentCondition: client_1.Condition.GOOD,
        criticality: client_1.Criticality.MEDIUM,
        responsibleDivision: 'Capital Project R&B Division',
        status: client_1.AssetStatus.ACTIVE,
        road: { roadLength: 12.0, roadCategory: 'Urban Arterial', surfaceType: 'Mastic Asphalt' },
        inspections: [
            {
                inspectionDate: new Date('2026-06-18'),
                inspectorName: 'Er. Priya Shah (EE)',
                condition: client_1.Condition.GOOD,
                observations: 'Excellent ride quality. Drainage channels completely clear.',
                recommendedAction: 'Routine kerb painting.',
                photoUrl: sampleImages.roadGood
            }
        ]
    },
    {
        assetCode: 'RD-BHV-006',
        name: 'Bhavnagar-Veraval Coastal Highway (SH-36)',
        assetType: client_1.AssetType.ROAD,
        district: 'Bhavnagar',
        location: 'Ghogha Port Access Road',
        latitude: 21.7645,
        longitude: 72.1519,
        constructionDate: new Date('2014-08-19'),
        currentCondition: client_1.Condition.POOR,
        criticality: client_1.Criticality.HIGH,
        responsibleDivision: 'Bhavnagar Coastal R&B Wing',
        status: client_1.AssetStatus.ACTIVE,
        road: { roadLength: 42.1, roadCategory: 'State Highway', surfaceType: 'Concrete Pavement' },
        inspections: [
            {
                inspectionDate: new Date('2026-05-12'),
                inspectorName: 'Er. Hardik Gohil (AE)',
                condition: client_1.Condition.POOR,
                observations: 'Joint sealant degradation and salt-air concrete spalling on slab edges.',
                recommendedAction: 'Reseal expansion joints and epoxy resin injection.',
                photoUrl: sampleImages.roadPoor
            }
        ],
        maintenances: [
            {
                issue: 'Expansion joint seal loss & salt spalling',
                priority: client_1.MaintenancePriority.HIGH,
                action: 'Polyurethane joint resealing & polymer mortar repair',
                assignedTo: 'Oceanic Infra Services',
                expectedCompletionDate: new Date('2026-09-10'),
                actualCompletionDate: new Date('2026-09-22'),
                cost: 650000,
                status: client_1.MaintenanceStatus.COMPLETED,
                beforePhotoUrl: sampleImages.beforeRepair,
                afterPhotoUrl: sampleImages.afterRepair
            }
        ]
    },
    {
        assetCode: 'RD-KTC-007',
        name: 'Bhuj-Khavda Rann Border Link Road',
        assetType: client_1.AssetType.ROAD,
        district: 'Kutch',
        location: 'Km 0 to Km 65 North Sector',
        latitude: 23.242,
        longitude: 69.6669,
        constructionDate: new Date('2012-03-30'),
        currentCondition: client_1.Condition.MODERATE,
        criticality: client_1.Criticality.HIGH,
        responsibleDivision: 'Kutch Strategic Roads Division',
        status: client_1.AssetStatus.ACTIVE,
        road: { roadLength: 65.0, roadCategory: 'Major District Road', surfaceType: 'Bituminous' },
        inspections: [
            {
                inspectionDate: new Date('2026-03-22'),
                inspectorName: 'Er. Vikram Jadeja (EE)',
                condition: client_1.Condition.MODERATE,
                observations: 'Sand accumulation in culverts and minor thermal cracking due to temperature extremes.',
                recommendedAction: 'De-silt culverts and apply slurry seal.',
                photoUrl: sampleImages.roadGood
            }
        ]
    },
    {
        assetCode: 'RD-AND-008',
        name: 'Anand-Nadiad Dairy Expressway Link',
        assetType: client_1.AssetType.ROAD,
        district: 'Anand',
        location: 'Amul Dairy Road Bypass',
        latitude: 22.5645,
        longitude: 72.9289,
        constructionDate: new Date('2021-02-14'),
        currentCondition: client_1.Condition.GOOD,
        criticality: client_1.Criticality.MEDIUM,
        responsibleDivision: 'Anand R&B Division',
        status: client_1.AssetStatus.ACTIVE,
        road: { roadLength: 14.5, roadCategory: 'Major District Road', surfaceType: 'Asphalt' },
        inspections: [
            {
                inspectionDate: new Date('2026-07-01'),
                inspectorName: 'Er. Kinjal Patel (AE)',
                condition: client_1.Condition.GOOD,
                observations: 'Smooth pavement, all signage and reflector studs fully functional.',
                recommendedAction: 'Continue annual inspection program.',
                photoUrl: sampleImages.roadGood
            }
        ]
    },
    // --- BRIDGES ---
    {
        assetCode: 'BRG-AMD-101',
        name: 'Sabarmati Riverfront Flyover Bridge (Subhash Span)',
        assetType: client_1.AssetType.BRIDGE,
        district: 'Ahmedabad',
        location: 'Subhash Bridge Circle, Sabarmati Crossing',
        latitude: 23.063,
        longitude: 72.582,
        constructionDate: new Date('2008-11-20'),
        currentCondition: client_1.Condition.MODERATE,
        criticality: client_1.Criticality.VERY_HIGH,
        responsibleDivision: 'Ahmedabad Bridge Cell R&B',
        status: client_1.AssetStatus.ACTIVE,
        bridge: { bridgeLength: 640.0, bridgeType: 'PSC Box Girder', numberOfLanes: 6 },
        inspections: [
            {
                inspectionDate: new Date('2026-01-15'),
                inspectorName: 'Er. D.K. Solanki (Bridge Expert)',
                condition: client_1.Condition.MODERATE,
                observations: 'Elastomeric bearing pads showing 15% shear strain. Expansion gap rubber strip damaged.',
                recommendedAction: 'Schedule elastomeric bearing replacement during non-peak night hours.',
                photoUrl: sampleImages.bridgeGood
            }
        ],
        maintenances: [
            {
                issue: 'Worn elastomeric bearings on Pier P4 and P5',
                priority: client_1.MaintenancePriority.HIGH,
                action: 'Jack up deck spans and replace 8 elastomeric bearing pads',
                assignedTo: 'Freyssinet India Bridge Specialists',
                expectedCompletionDate: new Date('2026-11-10'),
                cost: 1400000,
                status: client_1.MaintenanceStatus.ASSIGNED,
                beforePhotoUrl: sampleImages.bridgePoor
            }
        ]
    },
    {
        assetCode: 'BRG-SRT-102',
        name: 'Tapi River Cable-Stayed Bridge (Cable Span 3)',
        assetType: client_1.AssetType.BRIDGE,
        district: 'Surat',
        location: 'Adajan - Athwa Lines Connecting Corridor',
        latitude: 21.1959,
        longitude: 72.8122,
        constructionDate: new Date('2017-10-02'),
        currentCondition: client_1.Condition.CRITICAL,
        criticality: client_1.Criticality.VERY_HIGH,
        responsibleDivision: 'Surat Urban Infrastructure R&B Wing',
        status: client_1.AssetStatus.UNDER_MAINTENANCE,
        bridge: { bridgeLength: 915.0, bridgeType: 'Cable-Stayed', numberOfLanes: 6 },
        inspections: [
            {
                inspectionDate: new Date('2026-08-28'),
                inspectorName: 'Dr. S. N. Trivedi (Structural Auditor)',
                condition: client_1.Condition.CRITICAL,
                observations: 'Stay cable dampener vibration issue identified on Stay C-12 & C-14. Micro-fractures detected on expansion joint finger plate.',
                recommendedAction: 'Immediate lane restriction, vibration damper tuning & finger plate replacement.',
                photoUrl: sampleImages.bridgePoor
            }
        ],
        maintenances: [
            {
                issue: 'Vibration in stay cables C-12/C-14 & cracked finger plate',
                priority: client_1.MaintenancePriority.CRITICAL,
                action: 'Tuning dampers and replacing heavy-duty steel expansion finger plate',
                assignedTo: 'VSL Heavy Structures Pvt Ltd',
                expectedCompletionDate: new Date('2026-10-20'),
                cost: 3200000,
                status: client_1.MaintenanceStatus.IN_PROGRESS,
                beforePhotoUrl: sampleImages.beforeRepair
            }
        ]
    },
    {
        assetCode: 'BRG-VAD-103',
        name: 'Vishwamitri Railway Overbridge (ROB-12)',
        assetType: client_1.AssetType.BRIDGE,
        district: 'Vadodara',
        location: 'Near Central Railway Station Yard',
        latitude: 22.2965,
        longitude: 73.1945,
        constructionDate: new Date('1998-05-14'),
        currentCondition: client_1.Condition.POOR,
        criticality: client_1.Criticality.HIGH,
        responsibleDivision: 'Vadodara Special Projects Division',
        status: client_1.AssetStatus.ACTIVE,
        bridge: { bridgeLength: 380.0, bridgeType: 'Steel Truss & RCC Slab', numberOfLanes: 4 },
        inspections: [
            {
                inspectionDate: new Date('2026-04-18'),
                inspectorName: 'Er. R. V. Chaudhari (EE)',
                condition: client_1.Condition.POOR,
                observations: 'Steel truss gusset plates showing surface corrosion. Concrete parapet cracked near south abutment.',
                recommendedAction: 'Sandblasting, anti-corrosive painting, and RCC parapet rehabilitation.',
                photoUrl: sampleImages.bridgePoor
            }
        ],
        maintenances: [
            {
                issue: 'Gusset plate corrosion & cracked parapet wall',
                priority: client_1.MaintenancePriority.HIGH,
                action: 'Sandblasting, zinc spray coating, & concrete jacket repair',
                assignedTo: 'Baroda Structural Care',
                expectedCompletionDate: new Date('2026-08-30'),
                actualCompletionDate: new Date('2026-09-05'),
                cost: 980000,
                status: client_1.MaintenanceStatus.COMPLETED,
                beforePhotoUrl: sampleImages.beforeRepair,
                afterPhotoUrl: sampleImages.afterRepair
            }
        ]
    },
    {
        assetCode: 'BRG-RJK-104',
        name: 'Aji River Substructure Viaduct Bridge',
        assetType: client_1.AssetType.BRIDGE,
        district: 'Rajkot',
        location: 'Bhavnagar Highway Bypass Crossing',
        latitude: 22.285,
        longitude: 70.821,
        constructionDate: new Date('2014-03-25'),
        currentCondition: client_1.Condition.GOOD,
        criticality: client_1.Criticality.MEDIUM,
        responsibleDivision: 'Rajkot Highways & Bridges Wing',
        status: client_1.AssetStatus.ACTIVE,
        bridge: { bridgeLength: 290.0, bridgeType: 'RCC Continuous Beam', numberOfLanes: 4 },
        inspections: [
            {
                inspectionDate: new Date('2026-06-02'),
                inspectorName: 'Er. Tushar Vala (AE)',
                condition: client_1.Condition.GOOD,
                observations: 'Piers and deck slab in sound condition. Scour depth around pier P2 within permissible safety limits.',
                recommendedAction: 'Re-check scour depth post-monsoon.',
                photoUrl: sampleImages.bridgeGood
            }
        ]
    },
    {
        assetCode: 'BRG-GND-105',
        name: 'Narmada Canal Aqueduct & Overbridge',
        assetType: client_1.AssetType.BRIDGE,
        district: 'Gandhinagar',
        location: 'Koba-Gandhinagar Canal Crossing',
        latitude: 23.1678,
        longitude: 72.6455,
        constructionDate: new Date('2012-07-19'),
        currentCondition: client_1.Condition.GOOD,
        criticality: client_1.Criticality.HIGH,
        responsibleDivision: 'Capital Bridge Division',
        status: client_1.AssetStatus.ACTIVE,
        bridge: { bridgeLength: 420.0, bridgeType: 'Prestressed Concrete Girder', numberOfLanes: 6 },
        inspections: [
            {
                inspectionDate: new Date('2026-05-24'),
                inspectorName: 'Er. Mehul Jani (EE)',
                condition: client_1.Condition.GOOD,
                observations: 'Superstructure sound. Drainage spouts functioning cleanly.',
                recommendedAction: 'Standard routine maintenance.',
                photoUrl: sampleImages.bridgeGood
            }
        ]
    },
    {
        assetCode: 'BRG-KTC-106',
        name: 'Surajbari Creek Rail-cum-Road Bridge',
        assetType: client_1.AssetType.BRIDGE,
        district: 'Kutch',
        location: 'Little Rann Gateway Entry Point',
        latitude: 23.2105,
        longitude: 70.7321,
        constructionDate: new Date('2004-01-15'),
        currentCondition: client_1.Condition.POOR,
        criticality: client_1.Criticality.VERY_HIGH,
        responsibleDivision: 'Kutch Coastal Infrastructure Division',
        status: client_1.AssetStatus.ACTIVE,
        bridge: { bridgeLength: 1250.0, bridgeType: 'Prestressed Concrete Box Girder', numberOfLanes: 4 },
        inspections: [
            {
                inspectionDate: new Date('2026-07-11'),
                inspectorName: 'Er. A. K. Rathod (Bridge Specialist)',
                condition: client_1.Condition.POOR,
                observations: 'High salinity marine environment causing concrete cover spalling on pier caps P11-P14.',
                recommendedAction: 'Apply anti-carbonation coating and cathodic protection.',
                photoUrl: sampleImages.bridgePoor
            }
        ],
        maintenances: [
            {
                issue: 'Saline attack and concrete spalling on Pier Caps P11-P14',
                priority: client_1.MaintenancePriority.HIGH,
                action: 'Chipping affected concrete, applying zinc silicate primer and anti-sulfate polymer mortar',
                assignedTo: 'Corrosion Control India Ltd',
                expectedCompletionDate: new Date('2026-11-15'),
                cost: 2100000,
                status: client_1.MaintenanceStatus.PENDING,
                beforePhotoUrl: sampleImages.bridgePoor
            }
        ]
    },
    // --- BUILDINGS ---
    {
        assetCode: 'BLD-GND-201',
        name: 'Sardar Bhavan Secretariat Block-1 (R&B HQ)',
        assetType: client_1.AssetType.BUILDING,
        district: 'Gandhinagar',
        location: 'Sector 10, Secretariat Complex',
        latitude: 23.2235,
        longitude: 72.6492,
        constructionDate: new Date('2002-08-15'),
        currentCondition: client_1.Condition.GOOD,
        criticality: client_1.Criticality.VERY_HIGH,
        responsibleDivision: 'Capital Buildings R&B Division 1',
        status: client_1.AssetStatus.ACTIVE,
        building: { buildingType: 'State Government Administrative HQ', numberOfFloors: 9, builtUpArea: 28500.0 },
        inspections: [
            {
                inspectionDate: new Date('2026-06-10'),
                inspectorName: 'Er. S. M. Vaghela (Chief Architect & EE)',
                condition: client_1.Condition.GOOD,
                observations: 'Structural integrity intact. Central HVAC and fire safety systems certified.',
                recommendedAction: 'Exterior facade cleaning and solar panel integration maintenance.',
                photoUrl: sampleImages.buildingGood
            }
        ]
    },
    {
        assetCode: 'BLD-AMD-202',
        name: 'Ahmedabad District Collectorate & Revenue Towers',
        assetType: client_1.AssetType.BUILDING,
        district: 'Ahmedabad',
        location: 'Subhash Bridge Circle, Collector Office Campus',
        latitude: 23.058,
        longitude: 72.581,
        constructionDate: new Date('2011-03-10'),
        currentCondition: client_1.Condition.MODERATE,
        criticality: client_1.Criticality.HIGH,
        responsibleDivision: 'Ahmedabad Buildings Circle',
        status: client_1.AssetStatus.ACTIVE,
        building: { buildingType: 'District Collectorate Office', numberOfFloors: 7, builtUpArea: 19400.0 },
        inspections: [
            {
                inspectionDate: new Date('2026-03-19'),
                inspectorName: 'Er. N. K. Desai (AE)',
                condition: client_1.Condition.MODERATE,
                observations: 'Minor seepage observed on 4th floor west wing wall post pre-monsoon showers.',
                recommendedAction: 'Waterproofing treatment for terrace slab and west wall facade.',
                photoUrl: sampleImages.buildingGood
            }
        ],
        maintenances: [
            {
                issue: 'Terrace waterproofing membrane degradation causing 4th floor seepage',
                priority: client_1.MaintenancePriority.MEDIUM,
                action: 'Polyurethane liquid membrane application on terrace slab',
                assignedTo: 'DuraShield Waterproofing Ltd',
                expectedCompletionDate: new Date('2026-10-05'),
                cost: 380000,
                status: client_1.MaintenanceStatus.IN_PROGRESS,
                beforePhotoUrl: sampleImages.buildingPoor
            }
        ]
    },
    {
        assetCode: 'BLD-SRT-203',
        name: 'Surat New Regional R&B Laboratory & Office',
        assetType: client_1.AssetType.BUILDING,
        district: 'Surat',
        location: 'Majura Gate Campus, Ring Road',
        latitude: 21.1822,
        longitude: 72.821,
        constructionDate: new Date('2019-12-01'),
        currentCondition: client_1.Condition.GOOD,
        criticality: client_1.Criticality.MEDIUM,
        responsibleDivision: 'Surat R&B Quality Control Wing',
        status: client_1.AssetStatus.ACTIVE,
        building: { buildingType: 'Quality Testing Laboratory & Offices', numberOfFloors: 5, builtUpArea: 8200.0 },
        inspections: [
            {
                inspectionDate: new Date('2026-07-22'),
                inspectorName: 'Er. Nilesh Parikh (AE)',
                condition: client_1.Condition.GOOD,
                observations: 'Building in pristine condition. Material testing equipment calibrated.',
                recommendedAction: 'Standard routine maintenance.',
                photoUrl: sampleImages.buildingGood
            }
        ]
    },
    {
        assetCode: 'BLD-VAD-204',
        name: 'Vadodara Old Civil Hospital Heritage Wing B',
        assetType: client_1.AssetType.BUILDING,
        district: 'Vadodara',
        location: 'Raopura Road, Medical College Campus',
        latitude: 22.302,
        longitude: 73.201,
        constructionDate: new Date('1975-02-28'),
        currentCondition: client_1.Condition.CRITICAL,
        criticality: client_1.Criticality.VERY_HIGH,
        responsibleDivision: 'Vadodara Medical Buildings Wing',
        status: client_1.AssetStatus.UNDER_MAINTENANCE,
        building: { buildingType: 'Hospital & Healthcare Facility', numberOfFloors: 4, builtUpArea: 14200.0 },
        inspections: [
            {
                inspectionDate: new Date('2026-08-01'),
                inspectorName: 'Er. P. B. Bhatt (Structural Safety Officer)',
                condition: client_1.Condition.CRITICAL,
                observations: 'Severe concrete carbonation, rebar exposure, and lintel beam cracks in Ward 3 and 4.',
                recommendedAction: 'Evacuate Wing B immediately; begin structural retrofitting and carbon-wrap strengthening.',
                photoUrl: sampleImages.buildingPoor
            }
        ],
        maintenances: [
            {
                issue: 'Structural beam distress & rebar corrosion in hospital wing',
                priority: client_1.MaintenancePriority.CRITICAL,
                action: 'Micro-concrete jacketing and carbon fiber polymer wrap retrofitting',
                assignedTo: 'GeoStruct Engineering Services',
                expectedCompletionDate: new Date('2026-11-25'),
                cost: 4500000,
                status: client_1.MaintenanceStatus.IN_PROGRESS,
                beforePhotoUrl: sampleImages.beforeRepair
            }
        ]
    },
    {
        assetCode: 'BLD-RJK-205',
        name: 'Rajkot Circuit House Executive Annexe',
        assetType: client_1.AssetType.BUILDING,
        district: 'Rajkot',
        location: 'Race Course Road',
        latitude: 22.298,
        longitude: 70.795,
        constructionDate: new Date('2016-06-20'),
        currentCondition: client_1.Condition.GOOD,
        criticality: client_1.Criticality.MEDIUM,
        responsibleDivision: 'Rajkot Buildings Division 1',
        status: client_1.AssetStatus.ACTIVE,
        building: { buildingType: 'Government VIP Guest House', numberOfFloors: 4, builtUpArea: 6500.0 },
        inspections: [
            {
                inspectionDate: new Date('2026-05-10'),
                inspectorName: 'Er. Brijesh Makwana (EE)',
                condition: client_1.Condition.GOOD,
                observations: 'All suites, dining halls, and conference facilities functioning in top order.',
                recommendedAction: 'Routine landscape and paint touch-ups.',
                photoUrl: sampleImages.buildingGood
            }
        ]
    },
    {
        assetCode: 'BLD-JUN-206',
        name: 'Junagadh District Court & Judicial Complex',
        assetType: client_1.AssetType.BUILDING,
        district: 'Junagadh',
        location: 'Girnar Road Judicial Enclave',
        latitude: 21.5222,
        longitude: 70.4579,
        constructionDate: new Date('2009-10-10'),
        currentCondition: client_1.Condition.POOR,
        criticality: client_1.Criticality.HIGH,
        responsibleDivision: 'Junagadh R&B Executive Division',
        status: client_1.AssetStatus.ACTIVE,
        building: { buildingType: 'Judicial Complex & Courtrooms', numberOfFloors: 5, builtUpArea: 16800.0 },
        inspections: [
            {
                inspectionDate: new Date('2026-04-30'),
                inspectorName: 'Er. K. H. Solanki (AE)',
                condition: client_1.Condition.POOR,
                observations: 'Roof dampness, plaster peeling in central atrium and basement electrical panel room dampness.',
                recommendedAction: 'Basement tanking & roof elastomeric waterproofing.',
                photoUrl: sampleImages.buildingPoor
            }
        ],
        maintenances: [
            {
                issue: 'Basement dampness and atrium plaster peeling',
                priority: client_1.MaintenancePriority.HIGH,
                action: 'Negative side crystalline injection waterproofing & re-plastering',
                assignedTo: 'Girnar Infra Care',
                expectedCompletionDate: new Date('2026-10-25'),
                cost: 720000,
                status: client_1.MaintenanceStatus.ASSIGNED,
                beforePhotoUrl: sampleImages.buildingPoor
            }
        ]
    },
    {
        assetCode: 'BLD-MSH-207',
        name: 'Mehsana Polytechnic & R&B Sub-Division Campus',
        assetType: client_1.AssetType.BUILDING,
        district: 'Mehsana',
        location: 'Highway Campus, Mehsana North',
        latitude: 23.588,
        longitude: 72.3693,
        constructionDate: new Date('2013-09-01'),
        currentCondition: client_1.Condition.MODERATE,
        criticality: client_1.Criticality.MEDIUM,
        responsibleDivision: 'Mehsana R&B Division',
        status: client_1.AssetStatus.ACTIVE,
        building: { buildingType: 'Educational & Institutional', numberOfFloors: 3, builtUpArea: 11200.0 },
        inspections: [
            {
                inspectionDate: new Date('2026-06-25'),
                inspectorName: 'Er. Hetal Chaudhary (AE)',
                condition: client_1.Condition.MODERATE,
                observations: 'Cracks on boundary wall and minor plumbing leakages in student block.',
                recommendedAction: 'Repair boundary wall foundations and overhaul plumbing lines.',
                photoUrl: sampleImages.buildingGood
            }
        ]
    }
];
async function main() {
    console.log('Clearing existing data...');
    await prisma.user.deleteMany({});
    await prisma.riskAssessment.deleteMany({});
    await prisma.lifecycleEvent.deleteMany({});
    await prisma.maintenance.deleteMany({});
    await prisma.inspection.deleteMany({});
    await prisma.roadDetails.deleteMany({});
    await prisma.bridgeDetails.deleteMany({});
    await prisma.buildingDetails.deleteMany({});
    await prisma.asset.deleteMany({});
    console.log('Seeding demo users...');
    const defaultPasswordHash = await bcryptjs_1.default.hash('Admin@123', 10);
    const roadPasswordHash = await bcryptjs_1.default.hash('Road@123', 10);
    const bridgePasswordHash = await bcryptjs_1.default.hash('Bridge@123', 10);
    const buildingPasswordHash = await bcryptjs_1.default.hash('Building@123', 10);
    const fieldPasswordHash = await bcryptjs_1.default.hash('Field@123', 10);
    const demoUsers = [
        {
            name: 'Super Admin User',
            email: 'admin@rb-demo.com',
            passwordHash: defaultPasswordHash,
            role: client_1.Role.SUPER_ADMIN,
            department: 'R&B State HQ',
            assetCategory: 'ALL'
        },
        {
            name: 'R&B Dept Admin',
            email: 'rnbadmin@rb-demo.com',
            passwordHash: defaultPasswordHash,
            role: client_1.Role.RNB_ADMIN,
            department: 'R&B Executive Cell',
            assetCategory: 'ALL'
        },
        {
            name: 'Er. Alok Verma (Road Officer)',
            email: 'road@rb-demo.com',
            passwordHash: roadPasswordHash,
            role: client_1.Role.ROAD_OFFICER,
            department: 'Roads Division 1',
            assetCategory: 'ROAD'
        },
        {
            name: 'Er. Sunita Sharma (Bridge Officer)',
            email: 'bridge@rb-demo.com',
            passwordHash: bridgePasswordHash,
            role: client_1.Role.BRIDGE_OFFICER,
            department: 'Bridge & Structures Wing',
            assetCategory: 'BRIDGE'
        },
        {
            name: 'Er. Rajesh Patel (Building Officer)',
            email: 'building@rb-demo.com',
            passwordHash: buildingPasswordHash,
            role: client_1.Role.BUILDING_OFFICER,
            department: 'State Buildings Circle',
            assetCategory: 'BUILDING'
        },
        {
            name: 'Er. Hardik Solanki (Field Officer)',
            email: 'field@rb-demo.com',
            passwordHash: fieldPasswordHash,
            role: client_1.Role.FIELD_OFFICER,
            department: 'Field Audit & Inspection Wing',
            assetCategory: 'ALL'
        }
    ];
    for (const u of demoUsers) {
        await prisma.user.create({ data: u });
    }
    console.log('Seeding assets and lifecycle records...');
    for (const item of seedAssets) {
        const { road, bridge, building, inspections, maintenances, ...assetData } = item;
        // Create Asset
        const createdAsset = await prisma.asset.create({
            data: assetData,
        });
        // Create Subtype Details
        if (road && assetData.assetType === client_1.AssetType.ROAD) {
            await prisma.roadDetails.create({
                data: {
                    assetId: createdAsset.id,
                    ...road,
                }
            });
        }
        else if (bridge && assetData.assetType === client_1.AssetType.BRIDGE) {
            await prisma.bridgeDetails.create({
                data: {
                    assetId: createdAsset.id,
                    ...bridge,
                }
            });
        }
        else if (building && assetData.assetType === client_1.AssetType.BUILDING) {
            await prisma.buildingDetails.create({
                data: {
                    assetId: createdAsset.id,
                    ...building,
                }
            });
        }
        // Initial Lifecycle Event: CONSTRUCTED
        await prisma.lifecycleEvent.create({
            data: {
                assetId: createdAsset.id,
                eventType: client_1.EventType.CONSTRUCTED,
                eventDate: assetData.constructionDate,
                description: `Infrastructure asset constructed at ${assetData.location}, ${assetData.district}.`,
                performedBy: 'Gujarat R&B Works Department'
            }
        });
        // Initial Lifecycle Event: REGISTERED
        await prisma.lifecycleEvent.create({
            data: {
                assetId: createdAsset.id,
                eventType: client_1.EventType.REGISTERED,
                eventDate: new Date(assetData.constructionDate.getTime() + 7 * 86400000),
                description: `Digital Asset Passport registered under Code ${assetData.assetCode}. Division: ${assetData.responsibleDivision}.`,
                performedBy: 'System Administrator'
            }
        });
        // Inspections
        if (inspections && inspections.length > 0) {
            for (const insp of inspections) {
                await prisma.inspection.create({
                    data: {
                        assetId: createdAsset.id,
                        ...insp
                    }
                });
                await prisma.lifecycleEvent.create({
                    data: {
                        assetId: createdAsset.id,
                        eventType: client_1.EventType.INSPECTED,
                        eventDate: insp.inspectionDate,
                        description: `Field inspection conducted by ${insp.inspectorName}. Condition assessed as ${insp.condition}. Observations: ${insp.observations}`,
                        performedBy: insp.inspectorName
                    }
                });
            }
        }
        // Maintenances
        let activeMaintenancePriority = null;
        if (maintenances && maintenances.length > 0) {
            for (const maint of maintenances) {
                await prisma.maintenance.create({
                    data: {
                        assetId: createdAsset.id,
                        ...maint
                    }
                });
                if (maint.status !== client_1.MaintenanceStatus.COMPLETED) {
                    activeMaintenancePriority = maint.priority;
                }
                const maintAny = maint;
                let evType = client_1.EventType.MAINTENANCE_CREATED;
                if (maint.status === client_1.MaintenanceStatus.IN_PROGRESS)
                    evType = client_1.EventType.MAINTENANCE_STARTED;
                if (maint.status === client_1.MaintenanceStatus.COMPLETED)
                    evType = client_1.EventType.MAINTENANCE_COMPLETED;
                await prisma.lifecycleEvent.create({
                    data: {
                        assetId: createdAsset.id,
                        eventType: evType,
                        eventDate: maintAny.actualCompletionDate || maintAny.createdAt || new Date(),
                        description: `Work order [${maint.status}]: ${maint.issue}. Assigned to ${maint.assignedTo}. Cost: ₹${maint.cost.toLocaleString('en-IN')}`,
                        performedBy: maint.assignedTo
                    }
                });
            }
        }
        // Calculate & Record Initial Risk Assessment
        const riskResult = (0, riskEngine_1.calculateAssetRisk)({
            constructionDate: createdAsset.constructionDate,
            currentCondition: createdAsset.currentCondition,
            criticality: createdAsset.criticality,
            activeMaintenancePriority
        });
        await prisma.riskAssessment.create({
            data: {
                assetId: createdAsset.id,
                conditionScore: riskResult.conditionScore,
                ageScore: riskResult.ageScore,
                criticalityScore: riskResult.criticalityScore,
                maintenanceScore: riskResult.maintenanceScore,
                totalRiskScore: riskResult.totalRiskScore,
                riskLevel: riskResult.riskLevel
            }
        });
    }
    console.log('Seeding completed successfully!');
}
main()
    .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
