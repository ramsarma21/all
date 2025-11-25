export default function AboutPage() {
    return (
        <main className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-16">
            <h1 className="text-4xl font-bold text-blue-700">About AllergyPatrol</h1>
            <p className="text-lg leading-relaxed text-gray-800">
                AllergyPatrol was created to make finding recipes safer and easier for anyone
                managing dietary restrictions. We aggregate recipes from reliable sources and
                surface clear filters for cuisines, diets, and intolerances so you can cook with
                confidence.
            </p>
            <p className="text-lg leading-relaxed text-gray-800">
                This project is driven by a passion for inclusive cooking. Whether you are
                avoiding specific allergens or exploring new dietary lifestyles, AllergyPatrol
                aims to be your trusted companion in the kitchen.
            </p>
            <p className="text-lg leading-relaxed text-gray-800">
                Have ideas to make this better? Reach out and let us know how we can improve your
                experience and help more people enjoy great food without worry.
            </p>
        </main>
    );
}
