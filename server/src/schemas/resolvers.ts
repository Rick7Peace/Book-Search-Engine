import { User } from '../models/index.js';
import { signToken } from '../services/auth.js';
import { AuthenticationError } from '../services/auth.js';
import { UserDocument } from '../models/User.js';

interface Context {
  user?: UserDocument;
}
  
const resolvers = {
  Query: {
    me: async (_parent: any, _args: any, context: any): Promise<UserDocument | null> => {
        if (!context.user) {
          // If user is authenticated, return their profile
          return await User.findOne({ _id: context.user._id }).populate('savedBooks');
        }
        // If not authenticated, throw an authentication error
        throw new AuthenticationError('Not Authenticated');
      },
    },
  

  Mutation: {
    // Set up sign in and sign up mutations
    login: async (_parent: any, { email, password }: { email: string; password: string }): Promise<{ token: string; user: UserDocument }> => {
      // Find a profile by email
      const user = await User.findOne({ email });

      if (!user) {
        // If profile with provided email doesn't exist, throw an authentication error
        throw AuthenticationError; ('No user with this email found!');
      }
        // Check if the provided password is correct
      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        // If password is incorrect, throw an authentication error
        throw new AuthenticationError('Invalid password');
      }

      // Sign a JWT token for the authenticated profile
      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },

    addUser: async (_parent: any, { username, email, password }: { username: string; email: string; password: string }): Promise<{ token: string; user: UserDocument }> => {
      // Create a new profile with provided name, email, and password
      const user = await User.create({ username, email, password });
      // Sign a JWT token for the new profile
      const token = signToken(user.username, user.email, user._id);

      return { token, user };
    },

    saveBook: async (_parent: any, { bookData }: { bookData: any }, context: Context): Promise<UserDocument | null> => {
      if (context.user) {
        const updatedUser =
          await
            User.findOneAndUpdate(
              { _id: context.user._id },
              { $addToSet: { savedBooks: bookData } },
              { new: true, runValidators: true }
            ).populate('savedBooks');
        return updatedUser;
      }
      throw new AuthenticationError('You need to be logged in!');
    },

    removeBook: async (_parent: any, { bookId }: { bookId: string }, context: Context): Promise<UserDocument | null> => {
      if (context.user) {
        const updatedUser =
          await
            User.findOneAndUpdate(
              { _id: context.user._id },
              { $pull: { savedBooks: { bookId } } },
              { new: true }
            ).populate('savedBooks');
        return updatedUser;
      }
      throw new AuthenticationError('You need to be logged in!');
    },
    
  },
};

export default resolvers;
