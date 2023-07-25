// server.test.js
const request = require('supertest');
const app = require('./server');  // Importez votre application Express

describe('Test the Material routes', () => {
  let token = '5cb5947b-5fb3-4e3d-af9e-56d13d9319be';  // Utilisez un JWT valide

  it('Should create a new Material', async () => {
    const res = await request(app)
      .post('/Material')
      .set('Authorization', `Bearer ${token}`)
      .send({
        /* Votre objet Material ici */
      });

    expect(res.statusCode);
    expect(res.body);  // Vérifiez une propriété de la réponse
  });

  it('Should get all Materials', async () => {
    const res = await request(app)
      .get('/AllMaterial')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode);
    expect(res.body);  // Supposons que la réponse est un tableau
  });

  it('Should assign a Material to a user', async () => {
    const materialId = '646f03439762d1fa9736a1a7';  // Utilisez un id de matériel valide

    const res = await request(app)
      .post(`/assignedUser/${materialId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode);
    expect(res.body);  // Vérifiez une propriété de la réponse
  });
});
