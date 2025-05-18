// Dog API endpoints
const RANDOM_DOGS_API = 'https://dog.ceo/api/breeds/image/random/10';
const ALL_BREEDS_API = 'https://dog.ceo/api/breeds/list/all';
const BREED_INFO_API = 'https://api.thedogapi.com/v1/breeds/search?q=';

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    try {
        setupVoiceCommands();
        document.getElementById('audio-on').addEventListener('click', enableVoiceCommands);
        document.getElementById('audio-off').addEventListener('click', disableVoiceCommands);

        await loadRandomDogImages();
        await loadDogBreeds();
    } catch (error) {
        console.error('Initialization error:', error);
        alert('Failed to initialize page: ' + error.message);
    }
});

// Voice command setup
function setupVoiceCommands() {
    if (typeof annyang === 'undefined') return;

    annyang.addCommands({
        'load dog breed *breed': function(breed) {
            const normalized = breed.toLowerCase().trim();
            document.querySelectorAll('.breed-btn').forEach(button => {
                if (button.textContent.toLowerCase() === normalized) {
                    button.click();
                }
            });
        }
    });
}

function enableVoiceCommands() {
    if (annyang) {
        annyang.start();
        alert('Voice commands enabled! Try saying "Load dog breed golden"');
    }
}

function disableVoiceCommands() {
    if (annyang) {
        annyang.abort();
        alert('Voice commands disabled');
    }
}

// Load random dog images (manual slideshow only)
async function loadRandomDogImages() {
    try {
        const response = await fetch(RANDOM_DOGS_API);
        if (!response.ok) throw new Error('Failed to fetch dog images');

        const data = await response.json();
        const carousel = document.getElementById('dog-carousel');
        carousel.innerHTML = '';

        data.message.forEach(imgUrl => {
            const slide = document.createElement('div');
            slide.className = 'slider-item';

            const img = document.createElement('img');
            img.src = imgUrl;
            img.alt = 'Random dog';
            img.loading = 'lazy';
            img.onerror = () => {
                img.src = 'https://via.placeholder.com/500x300?text=Dog+Image+Not+Available';
            };

            slide.appendChild(img);
            carousel.appendChild(slide);
        });

        const slides = document.querySelectorAll('.slider-item');
        let currentSlide = 0;

        function showSlide(index) {
            slides.forEach((s, i) => {
                s.classList.remove('active');
                if (i === index) s.classList.add('active');
            });
        }

        function nextSlide() {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        }

        function prevSlide() {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(currentSlide);
        }

        if (slides.length > 0) {
            showSlide(currentSlide);

            const nextBtn = document.getElementById('next-slide');
            const prevBtn = document.getElementById('prev-slide');

            if (nextBtn && prevBtn) {
                nextBtn.addEventListener('click', nextSlide);
                prevBtn.addEventListener('click', prevSlide);
            }
        }

    } catch (error) {
        console.error('Error loading dog images:', error);
        alert('Failed to load dog slideshow. Please try again later.');
    }
}

// Load and display dog breeds
async function loadDogBreeds() {
    try {
        const response = await fetch(ALL_BREEDS_API);
        if (!response.ok) throw new Error('Failed to fetch breeds');

        const data = await response.json();
        const breeds = Object.keys(data.message);
        if (breeds.length === 0) throw new Error('No breeds found');

        const buttonsContainer = document.getElementById('breed-buttons');
        buttonsContainer.innerHTML = '';

        breeds.forEach(breed => {
            const button = document.createElement('button');
            button.className = 'breed-btn custom-btn';
            button.textContent = formatBreedName(breed);
            button.dataset.breed = breed;

            button.addEventListener('click', () => showBreedInfo(breed));
            buttonsContainer.appendChild(button);
        });

    } catch (error) {
        console.error('Error loading dog breeds:', error);

        const fallbackBreeds = [
            'labrador', 'poodle', 'beagle', 'bulldog', 'pug',
            'boxer', 'dachshund', 'chihuahua', 'husky', 'dalmatian'
        ];

        const buttonsContainer = document.getElementById('breed-buttons');
        buttonsContainer.innerHTML = '';

        fallbackBreeds.forEach(breed => {
            const button = document.createElement('button');
            button.className = 'breed-btn custom-btn';
            button.textContent = formatBreedName(breed);
            button.dataset.breed = breed;

            button.addEventListener('click', () => showBreedInfo(breed));
            buttonsContainer.appendChild(button);
        });
    }
}

// Format breed names
function formatBreedName(breed) {
    return breed.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// Show breed information
async function showBreedInfo(breed) {
    try {
        const infoContainer = document.getElementById('breed-info-container');
        const nameElement = document.getElementById('breed-name');
        const descElement = document.getElementById('breed-description');
        const lifeElement = document.getElementById('breed-life');

        infoContainer.style.display = 'block';
        nameElement.textContent = formatBreedName(breed);
        descElement.textContent = 'Loading information...';
        lifeElement.textContent = '...';

        const response = await fetch(`${BREED_INFO_API}${breed.toLowerCase()}`);
        if (!response.ok) throw new Error('Failed to fetch breed info');

        const data = await response.json();

        if (data.length > 0) {
            const breedInfo = data[0];
            descElement.textContent = breedInfo.temperament || 'No temperament description available';
            lifeElement.textContent = breedInfo.life_span || 'Life span information not available';
        } else {
            descElement.textContent = 'No detailed information available for this breed';
            lifeElement.textContent = 'Life span information not available';
        }

        infoContainer.scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        console.error('Error loading breed info:', error);
        document.getElementById('breed-description').textContent =
            'Failed to load breed information. Please try again later.';
    }
}
