# TODO List for Firebase Functions Enhancement

## Tasks to Complete
- [x] Update generateQR function in functions/index.js to encode family tree invitation data (familyTreeId, role, permission, invitationLink, expirationTime) as JSON in the QR code.
- [x] Add uuid dependency to package.json for generating unique invitation links if not provided.
- [ ] Test the updated generateQR function using Firebase emulator.
- [ ] Verify that exportFamilyTreePDF and exportFamilyTreePNG functions remain unchanged.
- [ ] Optionally, enhance export functions to include actual images if requested later.
te/Time]