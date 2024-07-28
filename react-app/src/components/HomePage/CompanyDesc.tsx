export default function CompanyDesc() {


    return (
        <div className='md:container md:mx-auto min-h-screen flex flex-col justify-center items-center'>
            <div className=' min-h-2 '></div>
            <div className=' flex flex-col justify-center items-center p-8'>
                <article className="prose text-center max-w-4xl">
                    <div>
                        <h1 className='relative inline-block'>
                            Pattes et partage
                        </h1>
                        <span className='block w-full h-2 bg-gray-600 mt-2 rounded'></span>
                    </div>
                    <h2>Garlic bread with cheese: What the science tells us</h2>
                    <p>
                        Welcome to Pattes et Partage, where our love for garlic bread with cheese is only rivaled by our passion for spooky, spine-chilling decor. Scientists have long pondered the mysteries of the perfect garlic bread: is it the crispy exterior, the gooey cheese, or the pungent garlic aroma that haunts your senses? We say, why not all three?
                    </p>
                    <p>
                        In our quest for the ultimate garlic bread experience, we've consulted top "breadologists" (yes, that's a thing), cheese artisans, and ghost hunters to ensure every bite is both delicious and delightfully terrifying. Whether you're here for the food or the frights, rest assured, your taste buds (and maybe your pants) are in for a treat.
                    </p>
                    <p>
                        So come on down, grab a slice, and prepare to be scared silly – by how much you'll love it!
                    </p>
                </article>
            </div>
            <div className='min-h-2 '></div> {/* Grow to push content to the bottom */}
        </div>
    )
}