const {onRequest} = require("firebase-functions/v2/https");
const QRCode = require("qrcode");
const PDFDocument = require("pdfkit");
const {v4: uuidv4} = require("uuid");

// Simple Hello World function
exports.helloWorld = onRequest((request, response) => {
  response.send("Hello, Tafyaa!");
});

// Test function to show how to use generateQR
exports.testQRParams = onRequest((request, response) => {
  const baseUrl = `${request.protocol}://${request.get("host")}`;
  const examples = {
    message: "QR Code Generation Examples",
    baseUrl: baseUrl,
    examples: [
      {
        description: "Default QR Code (no parameters)",
        url: `${baseUrl}/generateQR`,
      },
      {
        description: "Custom QR Code with parameters",
        url: `${baseUrl}/generateQR?familyTreeId=my-tree-456&role=admin&` +
          `permission=write&expirationTime=${Date.now() + 86400000}`,
      },
      {
        description: "QR Code for family member",
        url: `${baseUrl}/generateQR?familyTreeId=dupont-family&role=member&` +
          `permission=read&expirationTime=${Date.now() + 604800000}`,
      },
    ],
  };
  response.json(examples);
});

// QR Code generation function for family tree invitations
exports.generateQR = onRequest(async (request, response) => {
  try {
    // Use provided parameters or default values for testing
    const familyTreeId =
      request.query.familyTreeId || request.body.familyTreeId ||
      "demo-tree-123";
    const role = request.query.role || request.body.role || "member";
    const permission =
      request.query.permission || request.body.permission || "read";
    const invitationLink =
      request.query.invitationLink || request.body.invitationLink || uuidv4();
    const expirationTime =
      request.query.expirationTime || request.body.expirationTime ||
      (Date.now() + 86400000); // 24 hours from now

    const qrData = {
      familyTreeId,
      role,
      permission,
      invitationLink,
      expirationTime,
    };

    const data = JSON.stringify(qrData);

    // Generate QR code as PNG buffer
    const qrBuffer = await QRCode.toBuffer(data, {
      type: "png",
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    // Set response headers for image
    response.set("Content-Type", "image/png");
    const qrDisposition = "inline; filename=\"invitation-qrcode.png\"";
    response.set("Content-Disposition", qrDisposition);

    // Send the QR code image
    response.send(qrBuffer);
  } catch (error) {
    console.error("QR Code generation error:", error);
    response.status(500).send("Error generating QR code");
  }
});

// Family Tree data structure with images (arbre généalogique)
const sampleFamilyTree = {
  name: "Jean Dupont",
  birthYear: 1980,
  image: "https://example.com/images/jean.jpg", // URL to person's image
  spouse: "Marie Martin",
  spouseImage: "https://example.com/images/marie.jpg",
  children: [
    {
      name: "Sophie Dupont",
      birthYear: 2005,
      image: "https://example.com/images/sophie.jpg",
      spouse: "Pierre Leroy",
      spouseImage: "https://example.com/images/pierre.jpg",
      children: [
        {
          name: "Lucas Leroy",
          birthYear: 2030,
          image: "https://example.com/images/lucas.jpg",
        },
      ],
    },
    {
      name: "Thomas Dupont",
      birthYear: 2008,
      image: "https://example.com/images/thomas.jpg",
    },
  ],
};

// Export Family Tree as PDF with images
exports.exportFamilyTreePDF = onRequest(async (request, response) => {
  try {
    const doc = new PDFDocument();
    const treeData = request.body.tree || sampleFamilyTree;

    // Set response headers
    response.set("Content-Type", "application/pdf");
    const pdfDisposition = "inline; filename=\"arbre-genealogique.pdf\"";
    response.set("Content-Disposition", pdfDisposition);

    // Pipe PDF to response
    doc.pipe(response);

    // Add title
    doc.fontSize(24).text("Arbre Généalogique", 100, 50);
    doc.fontSize(12);

    // Recursive function to draw family tree with images
    const drawTree = async (person, x, y, depth = 0) => {
      const indent = depth * 120;
      const boxWidth = 100;
      const boxHeight = 120;

      // Draw person box
      doc.rect(x + indent, y, boxWidth, boxHeight).stroke();

      // Add person name and info
      doc.text(person.name, x + indent + 5, y + 5);
      doc.text("Né(e) en: " + person.birthYear, x + indent + 5, y + 20);

      // Placeholder for image (in real implementation, you'd fetch
      // and embed the image)
      doc.rect(x + indent + 10, y + 30, 80, 60);
      doc.stroke();
      doc.text("[Photo]", x + indent + 30, y + 60);

      // Draw spouse if exists
      if (person.spouse) {
        const spouseX = x + indent + boxWidth + 20;
        doc.rect(spouseX, y, boxWidth, boxHeight).stroke();
        doc.text(person.spouse, spouseX + 5, y + 5);
        doc.text("Conjoint(e)", spouseX + 5, y + 20);

        // Spouse image placeholder
        doc.rect(spouseX + 10, y + 30, 80, 60);
        doc.stroke();
        doc.text("[Photo]", spouseX + 30, y + 60);

        // Draw connecting line between spouses
        doc.moveTo(x + indent + boxWidth, y + boxHeight / 2);
        doc.lineTo(spouseX, y + boxHeight / 2);
        doc.stroke();
      }

      let currentY = y + boxHeight + 30;
      if (person.children && person.children.length > 0) {
        // Draw connecting line to children
        const spouseAdjustment = person.spouse ? boxWidth * 2 + 20 : boxWidth;
        const childrenX = x + indent + spouseAdjustment / 2;
        doc.moveTo(childrenX, y + boxHeight);
        doc.lineTo(childrenX, currentY - 10);
        doc.stroke();

        // Use for...of loop for async operations
        for (const child of person.children) {
          await drawTree(child, x, currentY, depth + 1);
          currentY += boxHeight + 50;
        }
      }
    };

    await drawTree(treeData, 100, 100);
    doc.end();
  } catch (error) {
    console.error("PDF export error:", error);
    response.status(500).send("Error generating PDF");
  }
});

// Export Family Tree as PNG (simplified version without canvas)
exports.exportFamilyTreePNG = onRequest(async (request, response) => {
  try {
    const treeData = request.body.tree || sampleFamilyTree;

    // Generate a simple text-based family tree representation
    const generateTreeText = (person, depth = 0) => {
      const indent = "  ".repeat(depth);
      let text = `${indent}${person.name} (${person.birthYear})\n`;

      if (person.spouse) {
        text += `${indent}  Spouse: ${person.spouse}\n`;
      }

      if (person.children && person.children.length > 0) {
        text += `${indent}  Children:\n`;
        person.children.forEach((child) => {
          text += generateTreeText(child, depth + 2);
        });
      }

      return text;
    };

    const treeText = "Family Tree\n" + "=".repeat(20) + "\n\n" +
      generateTreeText(treeData);

    // Return as plain text instead of PNG
    response.set("Content-Type", "text/plain");
    response.set("Content-Disposition", "inline; filename=\"family-tree.txt\"");
    response.send(treeText);
  } catch (error) {
    console.error("Tree export error:", error);
    response.status(500).send("Error generating family tree");
  }
});

