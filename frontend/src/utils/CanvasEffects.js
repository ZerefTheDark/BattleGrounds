// Enhanced Canvas Graphics Effects for The Dragon Stones

export class CanvasEffects {
  static createGradientTexture(ctx, width, height, colors) {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    colors.forEach((color, index) => {
      gradient.addColorStop(index / (colors.length - 1), color);
    });
    return gradient;
  }

  static createRadialGlow(ctx, x, y, innerRadius, outerRadius, color) {
    const gradient = ctx.createRadialGradient(x, y, innerRadius, x, y, outerRadius);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'transparent');
    return gradient;
  }

  static drawEnhancedToken(ctx, token, scale, isSelected = false, isPlayerView = false) {
    ctx.save();
    
    // Draw the token image if available, otherwise draw colored shape
    if (token.appearanceImage) {
      try {
        const img = new Image();
        img.onload = () => {
          ctx.save();
          
          // Create circular or square clipping path
          if (token.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(token.x, token.y, token.size, 0, Math.PI * 2);
            ctx.clip();
          } else {
            ctx.beginPath();
            ctx.rect(token.x - token.size, token.y - token.size, token.size * 2, token.size * 2);
            ctx.clip();
          }
          
          // Draw the image
          ctx.drawImage(
            img,
            token.x - token.size,
            token.y - token.size,
            token.size * 2,
            token.size * 2
          );
          
          ctx.restore();
          
          // Draw border
          if (isSelected) {
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 4 / scale;
            ctx.shadowColor = '#fbbf24';
            ctx.shadowBlur = 15 / scale;
          } else {
            ctx.strokeStyle = token.color;
            ctx.lineWidth = 3 / scale;
          }
          
          if (token.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(token.x, token.y, token.size, 0, Math.PI * 2);
            ctx.stroke();
          } else {
            ctx.strokeRect(
              token.x - token.size, 
              token.y - token.size, 
              token.size * 2, 
              token.size * 2
            );
          }
        };
        img.src = token.appearanceImage;
      } catch (error) {
        // Fallback to colored shape if image fails
        this.drawColoredToken(ctx, token, scale, isSelected);
      }
    } else {
      // Draw colored shape
      this.drawColoredToken(ctx, token, scale, isSelected);
    }
    
    // Draw token name below the token
    if (token.name) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = `${Math.max(10, 12 / scale)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.lineWidth = 2 / scale;
      
      const textY = token.y + token.size + 5 / scale;
      ctx.strokeText(token.name, token.x, textY);
      ctx.fillText(token.name, token.x, textY);
    }
    
    ctx.restore();
  }

  static drawColoredToken(ctx, token, scale, isSelected) {
    const gradient = ctx.createRadialGradient(
      token.x, token.y, 0,
      token.x, token.y, token.size
    );
    gradient.addColorStop(0, token.color);
    gradient.addColorStop(0.7, token.color);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
    
    // Selection glow
    if (isSelected) {
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 15 / scale;
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3 / scale;
    } else {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2 / scale;
    }
    
    ctx.fillStyle = gradient;
    
    if (token.shape === 'circle') {
      ctx.beginPath();
      ctx.arc(token.x, token.y, token.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillRect(
        token.x - token.size, 
        token.y - token.size, 
        token.size * 2, 
        token.size * 2
      );
      ctx.strokeRect(
        token.x - token.size, 
        token.y - token.size, 
        token.size * 2, 
        token.size * 2
      );
    }
  }

  static drawEnhancedGrid(ctx, camera, gridSize, canvasWidth, canvasHeight) {
    ctx.save();
    
    // Calculate visible area
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    
    const worldLeft = (-centerX) / camera.scale + camera.x;
    const worldRight = (canvasWidth - centerX) / camera.scale + camera.x;
    const worldTop = (-centerY) / camera.scale + camera.y;
    const worldBottom = (canvasHeight - centerY) / camera.scale + camera.y;
    
    // Draw major grid lines (every 5th line)
    const startX = Math.floor(worldLeft / gridSize) * gridSize;
    const endX = Math.ceil(worldRight / gridSize) * gridSize;
    const startY = Math.floor(worldTop / gridSize) * gridSize;
    const endY = Math.ceil(worldBottom / gridSize) * gridSize;
    
    // Minor grid lines
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.lineWidth = Math.max(0.5, 0.5 / camera.scale);
    ctx.beginPath();
    
    for (let x = startX; x <= endX; x += gridSize) {
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
    }
    
    for (let y = startY; y <= endY; y += gridSize) {
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
    }
    
    ctx.stroke();
    
    // Major grid lines (every 5th line)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.lineWidth = Math.max(1, 1 / camera.scale);
    ctx.beginPath();
    
    for (let x = startX; x <= endX; x += gridSize * 5) {
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
    }
    
    for (let y = startY; y <= endY; y += gridSize * 5) {
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
    }
    
    ctx.stroke();
    
    ctx.restore();
  }

  static drawEnhancedRuler(ctx, ruler, gridSize, scale) {
    if (!ruler.active || !ruler.start || !ruler.end) return;
    
    ctx.save();
    
    const dx = ruler.end.x - ruler.start.x;
    const dy = ruler.end.y - ruler.start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const squares = Math.round(distance / gridSize);
    const feet = squares * 5; // Each square is 5 feet in D&D
    
    // Draw ruler line with glow
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 10 / scale;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = Math.max(3, 3 / scale);
    ctx.setLineDash([15 / scale, 5 / scale]);
    
    ctx.beginPath();
    ctx.moveTo(ruler.start.x, ruler.start.y);
    ctx.lineTo(ruler.end.x, ruler.end.y);
    ctx.stroke();
    
    // Reset line dash and shadow
    ctx.setLineDash([]);
    ctx.shadowBlur = 0;
    
    // Draw measurement points
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(ruler.start.x, ruler.start.y, 4 / scale, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(ruler.end.x, ruler.end.y, 4 / scale, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw distance label with enhanced styling
    const midX = (ruler.start.x + ruler.end.x) / 2;
    const midY = (ruler.start.y + ruler.end.y) / 2;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(
      midX - 40 / scale, 
      midY - 25 / scale, 
      80 / scale, 
      20 / scale
    );
    
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1 / scale;
    ctx.font = `bold ${Math.max(12, 14 / scale)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const text = `${feet} ft`;
    ctx.strokeText(text, midX, midY);
    ctx.fillText(text, midX, midY);
    
    ctx.restore();
  }

  static drawEnhancedFog(ctx, fogReveals, camera, canvasWidth, canvasHeight) {
    if (fogReveals.length === 0) return;
    
    ctx.save();
    
    // Calculate visible area
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    
    const worldLeft = (-centerX) / camera.scale + camera.x;
    const worldRight = (canvasWidth - centerX) / camera.scale + camera.x;
    const worldTop = (-centerY) / camera.scale + camera.y;
    const worldBottom = (canvasHeight - centerY) / camera.scale + camera.y;
    
    // Draw fog overlay with gradient
    const fogGradient = ctx.createLinearGradient(
      worldLeft, worldTop, 
      worldRight, worldBottom
    );
    fogGradient.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
    fogGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.8)');
    fogGradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
    
    ctx.fillStyle = fogGradient;
    ctx.fillRect(
      worldLeft - 100, 
      worldTop - 100, 
      (worldRight - worldLeft) + 200, 
      (worldBottom - worldTop) + 200
    );
    
    // Cut out revealed areas with soft edges
    ctx.globalCompositeOperation = 'destination-out';
    
    fogReveals.forEach(reveal => {
      const revealGradient = ctx.createRadialGradient(
        reveal.x, reveal.y, 0,
        reveal.x, reveal.y, reveal.radius
      );
      revealGradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
      revealGradient.addColorStop(0.8, 'rgba(0, 0, 0, 0.8)');
      revealGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = revealGradient;
      ctx.beginPath();
      ctx.arc(reveal.x, reveal.y, reveal.radius * 1.2, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';
    
    ctx.restore();
  }

  static createRadialGradient(ctx, x, y, innerRadius, outerRadius, colors) {
    const gradient = ctx.createRadialGradient(x, y, innerRadius, x, y, outerRadius);
    colors.forEach((color, index) => {
      gradient.addColorStop(index / (colors.length - 1), color);
    });
    return gradient;
  }

  static darkenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }

  static lightenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }

  static addParticleEffects(ctx, particles) {
    particles.forEach(particle => {
      ctx.save();
      ctx.globalAlpha = particle.opacity;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  static drawEnhancedBackground(ctx, backgroundImage, scale) {
    if (!backgroundImage) return;
    
    ctx.save();
    
    // Add subtle texture overlay
    const img = new Image();
    img.onload = () => {
      const imgWidth = backgroundImage.width * (backgroundImage.scale || 1.2);
      const imgHeight = backgroundImage.height * (backgroundImage.scale || 1.2);
      
      // Draw main image
      ctx.drawImage(img, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
      
      // Add enhancement overlay
      ctx.globalCompositeOperation = 'overlay';
      ctx.fillStyle = 'rgba(16, 185, 129, 0.05)';
      ctx.fillRect(-imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
      
      ctx.globalCompositeOperation = 'source-over';
    };
    img.src = backgroundImage.dataUrl;
    
    ctx.restore();
  }
}