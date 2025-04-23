import '../styles/ItemCard.css';

function ItemCard({ name, price, image }) {
    return (
      <div className="item-card">
        <img src={image} alt={name} className="item-image" />
        <h3 className="item-name">{name}</h3>
        <p className="item-price">${price}</p>
      </div>
    );
  }
  
  export default ItemCard;