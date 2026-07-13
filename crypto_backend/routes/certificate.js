import express from "express";
import tls from "tls";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    let { host } = req.body;

    if (!host) {
      return res.status(400).json({
        error: "Website is required",
      });
    }

    host = host
      .replace(/^https?:\/\//, "")
      .replace(/\/.*$/, "");

    const socket = tls.connect(
      {
        host,
        port: 443,
        servername: host,
        rejectUnauthorized: false,
      },
      () => {
        try {
          const cert = socket.getPeerCertificate(true);

          if (!cert || Object.keys(cert).length === 0) {
            socket.end();

            return res.status(404).json({
              error: "Certificate not found",
            });
          }
            
        let algorithm = "Unknown";
          if (cert.nistCurve || cert.asn1Curve) {
            algorithm = "ECC";
            }
            else if (cert.modulus || cert.exponent) {
            algorithm = "RSA";
            }
            else if (cert.asymmetricKeyType) {
            const type = cert.asymmetricKeyType.toLowerCase();

            if (type.includes("rsa")) {
                algorithm = "RSA";
            } else if (type.includes("ec")) {
                algorithm = "ECC";
            }
            }

            let keySize = cert.bits || cert.asymmetricKeySize || cert.modulusLength || "Unknown";

            if (algorithm === "ECC" && cert.nistCurve) {
            keySize = `${cert.nistCurve} (${keySize} bit)`;
            } else if (algorithm === "RSA") {
            keySize = `${keySize} bit`;
            }
            socket.end();

         
          res.json({
            website: host,

            algorithm,

            keySize,

            issuer:
              cert.issuer?.O ||
              cert.issuer?.CN ||
              "Unknown",

            subject:
              cert.subject?.CN ||
              "Unknown",

            validFrom: cert.valid_from,

            validTo: cert.valid_to,

            serialNumber: cert.serialNumber,

            fingerprint: cert.fingerprint256,

            status:
              new Date(cert.valid_to) > new Date()
                ? "Valid"
                : "Expired",
          });
        } catch (err) {
          socket.end();

          res.status(500).json({
            error: err.message,
          });
        }
      }
    );

    socket.on("error", (err) => {
  let message = "Unable to analyze this website.";

  if (err.code === "ENOTFOUND") {
    message =
      "Invalid website. Please enter a valid website URL.";
  } else if (err.code === "ECONNREFUSED") {
    message = "The website refused the connection.";
  } else if (err.code === "ETIMEDOUT") {
    message = "The website took too long to respond.";
  } else if (err.code === "ECONNRESET") {
    message = "Connection was reset by the website.";
  }

  res.status(400).json({
    error: message,
  });
});
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

export default router;