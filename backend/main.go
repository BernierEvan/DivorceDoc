package main

import (
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// LegalConfig holds the legal constants and configuration
type LegalConfig struct {
	SMIC        float64 `json:"smic"`
	TaxRateLow  float64 `json:"tax_rate_low"`
	TaxRateHigh float64 `json:"tax_rate_high"`
	LegalPoints string  `json:"legal_points_method"`
}

func main() {
	r := gin.Default()

	// Configure CORS
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true // For development simplicity; restrict in production
	config.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type"}
	r.Use(cors.New(config))

	// API Routes
	api := r.Group("/api")
	{
		api.GET("/config", getConfig)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	r.Run(":" + port)
}

func getConfig(c *gin.Context) {
	// Values based on 2024/2025 French standards (approximate for demo)
	config := LegalConfig{
		SMIC:        1398.69, // Net monthly roughly
		TaxRateLow:  0.11,
		TaxRateHigh: 0.30,
		LegalPoints: "Pilotelle",
	}
	c.JSON(http.StatusOK, config)
}
