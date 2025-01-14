// const {response} = require('express'); // opcional
// (res = response)
const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const { generarJWT } = require('../helpers/jwt');
const crearUsuario = async(req, res) => {
  
  const { email, password } = req.body;

  try {
    let usuario = await Usuario.findOne({ email });
    if( usuario ){
      return res.status(400).json({
        ok: false,
        msg: 'Un usuario existe con ese correo',
      });  
    }
    
    usuario = new Usuario( req.body );
    const salt = bcrypt.genSaltSync();
    usuario.password = bcrypt.hashSync(password, salt);

    await usuario.save();
    
    //* crear JWT
    const token = await generarJWT( usuario.id, usuario.name );

    res.status(201).json({
      ok: true,
      uid: usuario.id,
      name: usuario.name,
      token
    });
    
  } catch (error) {
    console.log(error)
    res.status(500).json({
      ok: false,
      msg: 'por favor hable con el administrador',
    });
  }
}

const loginUsuario = async (req, res) => {
  const {email, password } = req.body;
  try {

    const usuario = await Usuario.findOne({ email });
    if( !usuario ){
      return res.status(400).json({
        ok: false,
        msg: 'El usuario no existe con ese email',
      });  
    }

    // confirmar passwords
    const validPassword = bcrypt.compareSync( password, usuario.password );
    if(!validPassword){
      return res.status(400).json({
        ok: false,
        msg: 'Password incorrecto',
      }); 
    }
    
    //* generar JWT
    const token = await generarJWT( usuario.id, usuario.name );

    res.json({
      ok: true,
      msg: 'login sucess',
      uid: usuario.id,
      name: usuario.name,
      token
    });
    
  } catch (error) {
    console.log(error)
    res.status(500).json({
      ok: false,
      msg: 'por favor hable con el administrador',
    });
  }
};

const revalidarToken = async (req, res) => {

  const uid = req.uid;
  const name = req.name;

  //* regenerar JWT
  const token = await generarJWT( uid, name );

  res.json({
    ok: true,
    token
  });
};


module.exports = {
  crearUsuario,
  loginUsuario,
  revalidarToken,
};