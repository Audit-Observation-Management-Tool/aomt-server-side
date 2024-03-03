function GenerateDocumentVersion(version) 
{
    const [major, minor, patch] = version.split('.').map(Number);
    let newPatch = patch + 1;

    if (newPatch > 9) 
    {
        newPatch = 0;
        const newMinor = minor + 1;
        if (newMinor > 9) 
        {
            const newMajor = major + 1;
            return `${newMajor}.0.0`;
        } 
        else 
        {
            return `${major}.${newMinor}.${newPatch}`;
        }
    } 
    else 
    {
        return `${major}.${minor}.${newPatch}`;
    }
}

module.exports = { GenerateDocumentVersion };