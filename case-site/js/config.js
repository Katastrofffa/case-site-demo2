const RARITIES = {
    knifeandgloves:   { label: '★',                    color: '#b0c3d9' },
    IndustrialGrade:  { label: 'Промышленное качество', color: '#5D6A75' },
    Milspec:          { label: 'Армейское качество',   color: '#4B69FF' },
    Restricted:       { label: 'Запрещенное',           color: '#8847FA' },
    Classified:       { label: 'Засекреченное',         color: '#D32CE6' },
    Consumergoods:    { label: 'Ширпотреб',             color: '#B0C3D9' },
    secret:           { label: 'Тайное',                color: '#EB4B4B' },
};

const SPIN_SETTINGS = {
    normal: { duration: 6000, slowdownPower: 3.5 },
    fast:   { duration: 2300, slowdownPower: 2.5 },
};

// Запасные цены по редкости, если у скина не указан price
const RARITY_SELL_PRICE = {
    knifeandgloves:   2000,
    IndustrialGrade:  10,
    Milspec:          30,
    Restricted:       150,
    Classified:       500,
    Consumergoods:    5,
    secret:           5000,
};

const CASES = [
    {
        id: 'mirage',
        name: 'Mirage',
        price: 4300,
        cover: 'assets/covers/mirage.png',
        items: [
            { name: 'AK-47 | Golden Arabesque', rarity: 'secret',    chance: 0.27,   price: 151000, image: 'Skins/ak47GoldenArabesque.png' },
            { name: 'AWP | Desert Hydra',       rarity: 'secret',    chance: 0.79,   price: 113000, image: 'Skins/awpdeserthydra.png' },
            { name: 'Desert Eagle | Fennec',    rarity: 'Classified',    chance: 1.62,   price: 27000,  image: 'Skins/deaglephoenix.png' },
            { name: 'MP5-SD | Oxide Oasis',     rarity: 'Classified',   chance: 2.34,     price: 13000,     image: 'Skins/OxideOasis.png' },
            { name: 'SG 553 | Desert Bloom',   rarity: 'Milspec', chance: 17.84, price: 230, image: 'Skins/DesertBloom.png' },
        ],
    },
];