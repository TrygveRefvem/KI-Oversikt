const mongoose = require('mongoose');

const initiativSchema = new mongoose.Schema({
  initiativId: {
    type: String,
    required: true,
    unique: true
  },
  tittel: {
    type: String,
    required: true
  },
  beskrivelse: {
    type: String,
    required: true
  },
  maal: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Ide', 'Mockup', 'PoC', 'Utvikling', 'Implementert', 'Avsluttet'],
    default: 'Ide'
  },
  ansvarlig: {
    type: String,
    required: true
  },
  startDato: {
    type: Date,
    default: Date.now
  },
  sluttDato: {
    type: Date
  },
  prioritet: {
    type: String,
    enum: ['Lav', 'Medium', 'Høy', 'Kritisk'],
    default: 'Medium'
  },
  kommentarer: {
    type: String
  },
  vedlegg: [{
    type: {
      type: String,
      enum: ['link', 'file'],
      required: true
    },
    navn: String,
    url: String,
    filsti: String
  }],
  handlinger: [{
    beskrivelse: {
      type: String,
      required: true
    },
    ansvarlig: String,
    frist: Date,
    status: {
      type: String,
      enum: ['Ikke startet', 'Pågår', 'Fullført'],
      default: 'Ikke startet'
    }
  }],
  opprettetDato: {
    type: Date,
    default: Date.now
  },
  sisteOppdatering: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Automatisk generering av initiativ-ID
initiativSchema.pre('save', async function(next) {
  // Hvis initiativId allerede er satt, ikke generer en ny
  if (this.initiativId && this.initiativId.match(/^KI-\d{3}$/)) {
    return next();
  }
  
  try {
    const count = await this.constructor.countDocuments();
    this.initiativId = `KI-${(count + 1).toString().padStart(3, '0')}`;
    next();
  } catch (error) {
    next(error);
  }
});

const Initiativ = mongoose.model('Initiativ', initiativSchema);

module.exports = Initiativ; 